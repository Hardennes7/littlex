"use client";
import React, { useEffect, useState } from "react";

export default function ThreadNavigator({ threadId }: { threadId?: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    // mock messages loader
    setMessages([
      'User A: I think AI will change social platforms.',
      'User B: Totally — new features are emerging.',
      'User C: What about moderation and trends?'
    ]);
  }, [threadId]);

  const handleSummarize = async () => {
    try {
      const r = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const j = await r.json();
      setSummary(j.summary || JSON.stringify(j));
    } catch (e) {
      setSummary('Error summarizing');
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h4>Thread Navigator</h4>
      <ol>
        {messages.map((m, i) => <li key={i} style={{ marginBottom: 6 }}>{m}</li>)}
      </ol>
      <button onClick={handleSummarize}>Summarize Thread</button>
      {summary && <div style={{ marginTop: 8, background: '#f6f6f6', padding: 8 }}>{summary}</div>}
    </div>
  );
}
