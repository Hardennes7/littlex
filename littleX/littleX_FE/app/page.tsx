"use client";
import { useState } from "react";

export default function AIDemo() {
  const [inputText, setInputText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHype = async () => {
    // 1. Start the "Loading" effect
    setLoading(true);
    setAiResponse("");

    // 2. Pretend to wait for AI (1.5 seconds)
    setTimeout(() => {
      
      // 3. Show the success message (Hardcoded for the demo)
      setAiResponse(`🚀 Hype activated! '${inputText}' has been viralized! 🔥`);
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", color: "white" }}>
      <h1>✨ LittleX AI Playground</h1>
      <p>Test the <b>Hype Man</b> agent before posting.</p>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type a boring sentence here..."
        style={{ width: "100%", height: "100px", padding: "10px", marginTop: "20px", color: "black" }}
      />

      <br />

      <button 
        onClick={handleHype}
        disabled={loading}
        style={{ 
          marginTop: "20px", 
          padding: "10px 20px", 
          backgroundColor: loading ? "#ccc" : "#0070f3", 
          color: "white", 
          border: "none", 
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "AI is thinking..." : "🚀 Hype It Up!"}
      </button>

      {aiResponse && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#222", borderRadius: "8px", border: "1px solid #444" }}>
          <h3>AI Suggestion:</h3>
          <p style={{ fontSize: "1.2em", color: "#00ff88" }}>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}