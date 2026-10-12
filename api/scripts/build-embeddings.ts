import { readFile, writeFile } from "node:fs/promises";

const RESUME_PATH = process.env.RESUME_PATH ?? "/repo-data/resume.md";
const CORPUS_OUT = process.env.CORPUS_OUT ?? "data/corpus.json";
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = (process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/+$/, "");
const EMBED_MODEL = process.env.LLM_EMBED_MODEL ?? "gemini-embedding-001";
const EMBED_DIMENSIONS = 768; // keep in sync with src/lib/llm.ts
const CORPUS_VERSION = process.env.CORPUS_VERSION ?? "v5";
const MAX_CHUNK_CHARS = 1500;

if (!LLM_API_KEY) {
  console.error("LLM_API_KEY not set");
  process.exit(1);
}

const resume = await readFile(RESUME_PATH, "utf-8");

const sections = resume.split(/\n(?=## )/g).map(s => s.trim()).filter(Boolean);

const chunks: string[] = [];
for (const section of sections) {
  if (section.length <= MAX_CHUNK_CHARS) {
    chunks.push(section);
    continue;
  }
  const paragraphs = section.split(/\n\n+/);
  let buf = "";
  for (const p of paragraphs) {
    const next = buf ? buf + "\n\n" + p : p;
    if (next.length > MAX_CHUNK_CHARS && buf) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = next;
    }
  }
  if (buf) chunks.push(buf);
}

console.log(`Embedding ${chunks.length} chunks…`);

const res = await fetch(`${LLM_BASE_URL}/embeddings`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LLM_API_KEY}`,
  },
  body: JSON.stringify({ model: EMBED_MODEL, input: chunks, dimensions: EMBED_DIMENSIONS }),
});

if (!res.ok) {
  console.error(`Embeddings request failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const data = await res.json() as { data: Array<{ embedding: number[] }> };

const corpus = {
  version: CORPUS_VERSION,
  model: EMBED_MODEL,
  dimensions: EMBED_DIMENSIONS,
  chunks: chunks.map((text, i) => ({
    text,
    embedding: data.data[i].embedding,
  })),
};

await writeFile(CORPUS_OUT, JSON.stringify(corpus, null, 2));
console.log(`Wrote ${chunks.length} chunks to ${CORPUS_OUT} (version=${CORPUS_VERSION})`);
