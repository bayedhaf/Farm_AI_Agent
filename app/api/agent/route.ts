// app/api/agent/route.ts
import { answerQuestion } from "@/lib/langchain";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, lang, userId } = body;
    if (!message) return new Response(JSON.stringify({ error: "missing message" }), { status: 400 });

    const answer = await answerQuestion({ question: message, lang: lang || "en", userId: userId || "anon" });

    return new Response(JSON.stringify({ answer }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
