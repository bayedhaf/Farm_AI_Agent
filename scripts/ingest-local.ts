// scripts/ingest-local.ts (run with ts-node or compile)
import fs from "fs";
import path from "path";
import { getCollection } from "../lib/mongo";
import { createEmbedding } from "../lib/embeddings";

function chunkText(text: string, maxLen = 1000) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + maxLen);
    chunks.push(chunk);
    i += maxLen;
  }
  return chunks;
}

async function main() {
  const filePath = process.argv[2] || "sample-farm-guide.txt";
  if (!fs.existsSync(filePath)) {
    console.error("Missing file path:", filePath);
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, "utf8");
  const chunks = chunkText(text, 800);
  const col = await getCollection("documents");

  for (const [index, chunk] of chunks.entries()) {
    const emb = await createEmbedding(chunk);
    await col.insertOne({
      source: path.basename(filePath),
      chunk_text: chunk,
      embedding: emb,
      metadata: { chunk_index: index },
      createdAt: new Date()
    });
    console.log("Inserted chunk", index);
  }

  console.log("Ingest finished");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
