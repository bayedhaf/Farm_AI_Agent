// lib/hf.ts
import fetch from "node-fetch";

const HF_KEY = process.env.HUGGINGFACE_API_KEY!;
const HF_MODEL = process.env.HF_MODEL || "bigscience/bloom";

if (!HF_KEY) throw new Error("Missing HUGGINGFACE_API_KEY in env");

export async function generateFromHF(prompt: string, max_tokens = 512) {
  const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: max_tokens, return_full_text: false }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF inference error: ${res.status} ${text}`);
  }

  const data = await res.json();
  // HF returns array or object depending on model; common: [{generated_text: "..."}]
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (data.generated_text) return data.generated_text;
  if (typeof data === "string") return data;
  return JSON.stringify(data);
}
