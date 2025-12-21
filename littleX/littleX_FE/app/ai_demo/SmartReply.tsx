"use client";
import React, { useState } from "react";

export default function SmartReply({ message }: { message?: string }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/ai/hype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message || '', style: 'professional' })
      });
      const j = await r.json();
      setReply(j.enhanced || JSON.stringify(j));
    } catch (e) {
      setReply('Error getting suggestion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h4>Smart Reply</h4>
      <div style={{ marginBottom: 8 }}>{message}</div>
      <div>
        <button onClick={handleSuggest} disabled={loading || !message}>Suggest Reply</button>
      </div>
      {reply && <div style={{ marginTop: 8, background: '#f6f6f6', padding: 8 }}>{reply}</div>}
    </div>
  );
}
