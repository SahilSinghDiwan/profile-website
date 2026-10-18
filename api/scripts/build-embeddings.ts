import { readFile, writeFile } from "node:fs/promises";

const RESUME_PATH = process.env.RESUME_PATH ?? "/repo-data/resume.md";
const CORPUS_OUT = process.env.CORPUS_OUT ?? "data/corpus.json";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN; // needs Workers AI read/run permission
const EMBED_MODEL = process.env.LLM_EMBED_MODEL ?? "@cf/baai/bge-base-en-v1.5"; // keep in sync with src/lib/llm.ts
const CORPUS_VERSION = process.env.CORPUS_VERSION ?? "v7";
const MAX_CHUNK_CHARS = 1500;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("CF_ACCOUNT_ID and CF_API_TOKEN must be set");
  process.exit(1);
}

// The PDF resume keeps phone and email; the chat must not repeat them (LinkedIn is the only public contact route).
const resume = (await readFile(RESUME_PATH, "utf-8"))
  .replace(/ \| \+91 [\d-]+/g, "")
  .replace(/ \| \[[^\]]+@[^\]]+\]\(mailto:[^)]+\)/g, "");

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

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${EMBED_MODEL}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${CF_API_TOKEN}` },
    body: JSON.stringify({ text: chunks }),
  },
);

if (!res.ok) {
  console.error(`Embeddings request failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const body = await res.json() as { result: { data: number[][] } };
const vectors = body.result.data;
if (vectors.length !== chunks.length) {
  console.error(`Expected ${chunks.length} vectors, got ${vectors.length}`);
  process.exit(1);
}

const corpus = {
  version: CORPUS_VERSION,
  model: EMBED_MODEL,
  dimensions: vectors[0].length,
  chunks: chunks.map((text, i) => ({
    text,
    embedding: vectors[i],
  })),
};

await writeFile(CORPUS_OUT, JSON.stringify(corpus, null, 2));
console.log(`Wrote ${chunks.length} chunks to ${CORPUS_OUT} (version=${CORPUS_VERSION})`);
