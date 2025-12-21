"use client";
import React, { useState } from "react";

export default function AIWritingAssistant() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/hype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: "viral" }),
      });
      const data = await res.json();
      setResult(data.enhanced || JSON.stringify(data));
    } catch (e) {
      setResult("Error contacting AI backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>AI Writing Assistant</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your idea here..."
        style={{ width: "100%", height: 120 }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleGenerate} disabled={loading || !prompt}>
          {loading ? "Generating…" : "Suggest improvements"}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 12, background: "#f6f6f6", padding: 12 }}>
          <strong>Suggestion</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
