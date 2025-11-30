// lib/embeddings.ts
import fetch from "node-fetch";

const OPENAI_EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""; // optional; if set, prefer OpenAI

export async function createEmbedding(text: string): Promise<number[]> {
  if (OPENAI_API_KEY) {
    // Use OpenAI embeddings
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ input: text, model: OPENAI_EMBEDDING_MODEL })
    });
    const j = await res.json();
    return j.data[0].embedding;
  } else {
    // Fallback: use a simple hashed embedding (not recommended for production)
    // Here we produce a tiny deterministic vector to allow basic similarity.
    const vec = new Array(1536).fill(0).map((_, i) => ((text.charCodeAt(i % text.length) || 0) % 10) / 10);
    return vec;
  }
}
