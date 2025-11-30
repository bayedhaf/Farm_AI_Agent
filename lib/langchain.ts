// lib/langchain.ts
import { getCollection } from "./mongo";
import { generateFromHF } from "./hf";
import { createEmbedding } from "./embeddings";

type Doc = {
  _id: any;
  chunk_text: string;
  embedding: number[];
  metadata?: any;
};

function cosineSim(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

export async function answerQuestion({ question, lang = "en", userId = "anon" }: { question: string; lang?: string; userId?: string }) {
  const col = await getCollection("documents");
  const memCol = await getCollection("memories");

  // 1) embedding for query
  const qEmb = await createEmbedding(question);

  // 2) retrieval: fetch candidates and compute similarity (if you have Atlas vector search use it instead)
  // Here: simple approach — load a limited set and compute cosine. For large scale, use vector index.
  const candidates = await col.find().limit(200).toArray() as Doc[];
  const scored = candidates.map(d => ({ doc: d, score: cosineSim(qEmb, d.embedding || []) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5).map(s => s.doc.chunk_text);

  const context = top.join("\n\n");

  // 3) compose prompt (instruct to answer in same language)
  const system = `You are an expert agricultural assistant for smallholder farmers. Answer in ${lang === "am" ? "Amharic" : lang === "om" ? "Afaan Oromo" : "English"}. Use the provided Farmer Knowledge. If unsure say you don't know and give safe suggestions. Keep answers actionable and short.`;
  const prompt = `${system}\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

  // 4) call HF model
  const hfResp = await generateFromHF(prompt, 256);

  // 5) save memory (we store both question and answer embeddings)
  try {
    const qemb = qEmb;
    const aemb = await createEmbedding(hfResp);
    await memCol.insertOne({ user_id: userId, question, answer: hfResp, qemb, aemb, timestamp: new Date() });
  } catch (err) {
    console.warn("Memory store failed:", err);
  }

  return hfResp;
}
