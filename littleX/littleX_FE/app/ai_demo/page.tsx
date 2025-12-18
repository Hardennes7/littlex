"use client"; // <--- Add this at the very top!
import { useState } from "react";

export default function AIDemo() {
  const [inputText, setInputText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHype = async () => {
    setLoading(true);
    setAiResponse("");

    try {
        const response = await fetch("http://localhost:8000/walker/hype_man_pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: inputText }),
      });

      const data = await response.json();
      if (data.report && data.report.length > 0) {
        setAiResponse(data.report[0]); 
      } else {
        setAiResponse("AI connected, but returned no text.");
      }
    } catch (error) {
      console.error(error);
      setAiResponse("Error connecting to Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>✨ LittleX AI Playground</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type something boring..."
        style={{ width: "100%", height: "100px", padding: "10px", marginTop: "20px", color: "black" }}
      />
      <button 
        onClick={handleHype}
        disabled={loading}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: loading ? "#ccc" : "#0070f3", color: "white", border: "none" }}
      >
        {loading ? "Thinking..." : "🚀 Hype It Up!"}
      </button>
      {aiResponse && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#111", borderRadius: "8px" }}>
          <p style={{ fontSize: "1.2em", color: "#00ff88" }}>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}