import type { Env } from "../index";
import { cacheKey, createKvCache, CORPUS_VERSION } from "../lib/cache";
import { checkRateLimit, clientIp, rateLimitHeaders } from "../lib/ratelimit";
import { verifyTurnstile } from "../lib/turnstile";
import { llmConfig, embedText, deltaText } from "../lib/llm";
import bundledCorpus from "../../data/corpus.json";

const RL_CFG = { limit: 10, windowSec: 60 };
// Calibrated for @cf/baai/bge-base-en-v1.5 (2026-10-12): off-topic 0.45-0.53, on-topic 0.56-0.77.
// Re-measure if the embedding model changes. The system prompt is the second guard.
const RELEVANCE_THRESHOLD = 0.55;

interface Chunk {
  text: string;
  embedding: number[];
}

interface Corpus {
  version: string;
  chunks: Chunk[];
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const MAX_TURNS = 12;
const MAX_TURN_CHARS = 2000;

const corpus = bundledCorpus as Corpus;

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
  // Parse request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  const chatReq = body as Record<string, unknown>;
  const turnstileToken = chatReq.turnstileToken as string;

  // Accept either a multi-turn `messages` array or a legacy single `question`.
  let turns: ChatTurn[];
  if (Array.isArray(chatReq.messages)) {
    turns = (chatReq.messages as unknown[])
      .filter((t): t is ChatTurn => {
        if (!t || typeof t !== "object") return false;
        const x = t as { role?: unknown; content?: unknown };
        return (
          (x.role === "user" || x.role === "assistant") &&
          typeof x.content === "string" &&
          x.content.length > 0
        );
      })
      .slice(-MAX_TURNS)
      .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN_CHARS) }));
  } else if (typeof chatReq.question === "string" && chatReq.question.length > 0) {
    turns = [{ role: "user", content: (chatReq.question as string).slice(0, MAX_TURN_CHARS) }];
  } else {
    turns = [];
  }

  const lastUserTurn = [...turns].reverse().find((t) => t.role === "user");
  if (!lastUserTurn) {
    return new Response(JSON.stringify({ error: "missing_question" }), { status: 400 });
  }
  const question = lastUserTurn.content;

  if (!turnstileToken || typeof turnstileToken !== "string") {
    return new Response(JSON.stringify({ error: "missing_turnstile_token" }), { status: 401 });
  }

  // Verify Turnstile (unless dev mode)
  const isDev = env.ENV === "dev" && new URL(request.url).searchParams.has("dev");
  if (!isDev) {
    try {
      const turnstileResult = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken);
      if (!turnstileResult.ok) {
        return new Response(JSON.stringify({ error: "turnstile_failed" }), { status: 401 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "turnstile_error" }), { status: 401 });
    }
  }

  // Rate limit
  const ip = clientIp(request);
  const rl = await checkRateLimit(env.RATE_LIMIT, "chat", ip, RL_CFG);
  const headers = new Headers({ ...rateLimitHeaders(rl, RL_CFG) });
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers,
    });
  }

  // Cache key on the entire conversation so multi-turn chats don't collide
  // with single-turn cache hits and follow-ups can still benefit when repeated.
  const cacheKey_ = await cacheKey(JSON.stringify(turns), CORPUS_VERSION);
  const cache = createKvCache<string>(env.CACHE);
  const cached = await cache.get(cacheKey_);
  if (cached) {
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "hit");
    return new Response(cached, { status: 200, headers });
  }

  // Embed the question with the same model used to build the corpus
  if (!env.AI) {
    return new Response(JSON.stringify({ error: "embedding_unavailable" }), { status: 500 });
  }
  const questionEmbedding = await embedText(env, question);
  if (!questionEmbedding) {
    return new Response(JSON.stringify({ error: "embedding_failed" }), { status: 502 });
  }

  // Rank chunks by cosine similarity, take top 4
  const scored = corpus.chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 4).map((s) => s.chunk.text);

  const bestScore = scored[0]?.score ?? 0;
  if (bestScore < RELEVANCE_THRESHOLD) {
    const response = "I'm specifically trained to answer questions about Sahil's portfolio and experience. Your question seems outside that scope. Feel free to ask about his projects, skills, or background!";
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "miss");
    await cache.set(cacheKey_, response, 7 * 24 * 60 * 60); // Cache for 7 days
    return new Response(response, { status: 200, headers });
  }

  // Check if the LLM provider is configured
  if (!env.AI) {
    const response =
      "I'm unable to generate a response right now. The AI backend is not configured. Please check back later.";
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "miss");
    return new Response(response, { status: 200, headers });
  }

  // Stream completion from the configured chat model
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  headers.set("X-Cache-Status", "miss");

  const context = topChunks.join("\n\n");
  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt =
    `You are a Q&A assistant for Sahil Diwan's portfolio. Today's date is ${today}; dates up to today are in the past, not typos. Always refer to Sahil in the third person ("Sahil", "he"). Answer ONLY using the provided context. If the question is not about Sahil's background, skills, projects or experience (for example poems, trivia, maths, coding help), do not answer it: reply that you can only answer questions about Sahil's portfolio and experience. If the context does not contain the answer, say so. Format replies in concise GitHub-flavored markdown — short paragraphs, bullet lists where helpful.`;

  try {
    const llm = llmConfig(env);
    const aiStream = (await env.AI.run(llm.chatModel, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Context:\n${context}` },
        ...turns,
      ],
      stream: true,
      max_tokens: 800,
    })) as ReadableStream<Uint8Array> | null;

    const reader = aiStream?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: "no_stream" }), { status: 500 });
    }

    let fullResponse = "";
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        const processLine = (line: string) => {
          if (!line.startsWith("data: ")) return;
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const content = deltaText(JSON.parse(data));
            if (content) {
              fullResponse += content;
              if (fullResponse.length > 1600) {
                fullResponse = fullResponse.slice(0, 1600);
              }
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // Skip malformed JSON; only complete lines reach here.
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              const tail = buffer + decoder.decode();
              if (tail) {
                for (const line of tail.split("\n")) processLine(line.trim());
              }
              await cache.set(cacheKey_, fullResponse, 7 * 24 * 60 * 60);
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            let newlineIdx: number;
            while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, newlineIdx).trim();
              buffer = buffer.slice(newlineIdx + 1);
              if (line) processLine(line);
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, { status: 200, headers });
  } catch (error) {
    console.warn(`chat run failed: ${String(error).slice(0, 200)}`);
    return new Response(JSON.stringify({ error: "llm_error" }), { status: 502 });
  }
}
