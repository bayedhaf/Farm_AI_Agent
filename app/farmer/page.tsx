
"use client";

import { useState } from "react";

export default function FarmerChat() {
  const [message, setMessage] = useState("");
  const [lang, setLang] = useState("om");
  const [conversation, setConversation] = useState<{ role: string; text: string }[]>([]);

  async function sendMessage() {
    if (!message.trim()) return;
    const userMsg = { role: "user", text: message };
    setConversation((c) => [...c, userMsg]);
    setMessage("");

    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ message, lang, userId: "demo-user" }),
      headers: { "Content-Type": "application/json" }
    });

    const j = await res.json();
    const assistant = { role: "assistant", text: j.answer || "No answer" };
    setConversation((c) => [...c, assistant]);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Farmer AI Assistant</h1>

      <div className="mb-3">
        <label className="mr-2">Language</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="border p-1">
          <option value="en">English</option>
          <option value="om">Afaan Oromo</option>
          <option value="am">Amharic</option>
        </select>
      </div>

      <div className="mb-4">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border p-2" placeholder="Ask your farming question..." />
        <button onClick={sendMessage} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Gaaffadhu</button>
      </div>

      <div className="space-y-3">
        {conversation.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.role === "user" ? "bg-gray-100 self-end" : "bg-blue-50"}`}>
            <strong className="block text-sm text-gray-600">{m.role}</strong>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
