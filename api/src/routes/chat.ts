import type { Env } from "../index";
import { cacheKey, createKvCache, CORPUS_VERSION } from "../lib/cache";
import { checkRateLimit, clientIp, rateLimitHeaders } from "../lib/ratelimit";
import { verifyTurnstile } from "../lib/turnstile";

const CHAT_MODEL = "gpt-5-nano";
const RL_CFG = { limit: 10, windowSec: 60 };

interface ChatRequest {
  question: string;
  turnstileToken: string;
}

interface Chunk {
  text: string;
  embedding: number[];
}

interface Corpus {
  version: string;
  chunks: Chunk[];
}

// Simple cosine similarity implementation
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

// Mock embedding function (returns a simple vector based on input hash)
function mockEmbedding(text: string): number[] {
  // Generate a simple deterministic embedding for testing
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const embedding: number[] = [];
  for (let i = 0; i < 3; i++) {
    embedding.push((Math.sin(hash + i) * 1000) % 1);
  }
  return embedding;
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
  const question = chatReq.question as string;
  const turnstileToken = chatReq.turnstileToken as string;

  if (!question || typeof question !== "string") {
    return new Response(JSON.stringify({ error: "missing_question" }), { status: 400 });
  }

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

  // Cache check
  const cacheKey_ = await cacheKey(question, CORPUS_VERSION);
  const cache = createKvCache<string>(env.CACHE);
  const cached = await cache.get(cacheKey_);
  if (cached) {
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "hit");
    return new Response(cached, { status: 200, headers });
  }

  // Load corpus (default fallback for testing)
  let corpus: Corpus = {
    version: "v1",
    chunks: [
      {
        text: "Sahil Diwan is an AI/GenAI Engineer with expertise in incident management systems, real-time log analysis, and machine learning platforms.",
        embedding: [0.1, 0.2, 0.3],
      },
      {
        text: "Core technologies include Python, Kubernetes, Apache Kafka, Elasticsearch, FAISS, LangChain, and Microsoft Azure.",
        embedding: [0.2, 0.3, 0.4],
      },
    ],
  };

  try {
    const corpusUrl = new URL(
      "https://raw.githubusercontent.com/SahilSinghDiwan/profile-website/main/api/data/corpus.json",
    );
    const corpusRes = await fetch(corpusUrl);
    if (corpusRes.ok) {
      corpus = (await corpusRes.json()) as Corpus;
    }
  } catch {
    // Use default corpus if loading fails
  }

  // Embed question (mock - use simple hash for now)
  const questionEmbedding = mockEmbedding(question);

  // Find top 4 relevant chunks
  const scored = corpus.chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 4).map((s) => s.chunk.text);

  // If no relevant chunks (low scores), return polite refusal
  const bestScore = scored[0]?.score ?? 0;
  if (bestScore < 0.1) {
    const response = "I'm specifically trained to answer questions about Sahil's portfolio and experience. Your question seems outside that scope. Feel free to ask about his projects, skills, or background!";
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "miss");
    await cache.set(cacheKey_, response, 7 * 24 * 60 * 60); // Cache for 7 days
    return new Response(response, { status: 200, headers });
  }

  // Check if OpenAI is available
  if (!env.OPENAI_API_KEY) {
    const response =
      "I'm unable to generate a response right now. The AI backend is not configured. Please check back later.";
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Cache-Status", "miss");
    return new Response(response, { status: 200, headers });
  }

  // Stream completion from CHAT_MODEL
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  headers.set("X-Cache-Status", "miss");

  const context = topChunks.join("\n\n");
  const systemPrompt =
    "You are a Q&A assistant for Sahil Diwan's portfolio. Answer ONLY using the provided context. If unknown, say so.";

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: `Context:\n${context}` },
          { role: "user", content: question },
        ],
        stream: true,
        max_tokens: 400,
      }),
    });

    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ error: "openai_error" }), { status: 502 });
    }

    const reader = openaiRes.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: "no_stream" }), { status: 500 });
    }

    let fullResponse = "";
    const decoder = new TextDecoder();

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Cache the final response
              await cache.set(cacheKey_, fullResponse, 7 * 24 * 60 * 60);
              controller.close();
              break;
            }

            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data) as { choices: Array<{ delta: { content?: string } }> };
                  const content = parsed.choices[0]?.delta?.content ?? "";
                  if (content) {
                    fullResponse += content;
                    // Cap at 400 tokens (rough estimate: ~4 chars per token)
                    if (fullResponse.length > 1600) {
                      fullResponse = fullResponse.slice(0, 1600);
                    }
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch {
                  // Ignore parse errors for incomplete JSON
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: "streaming_error" }), { status: 500 });
  }
}
