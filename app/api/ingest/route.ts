// app/api/ingest/route.ts
import { createEmbedding } from "@/lib/embeddings";
import { getCollection } from "@/lib/mongo";

export async function POST(req: Request) {
  const body = await req.json();
  const { text, source } = body;
  if (!text) return new Response(JSON.stringify({ error: "missing text" }), { status: 400 });

  const chunks = [];
  const maxLen = 800;
  for (let i = 0; i < text.length; i += maxLen) chunks.push(text.slice(i, i + maxLen));

  const col = await getCollection("documents");
  for (const [i, chunk] of chunks.entries()) {
    const emb = await createEmbedding(chunk);
    await col.insertOne({ source: source || "uploaded", chunk_text: chunk, embedding: emb, metadata: { index: i }, createdAt: new Date() });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
