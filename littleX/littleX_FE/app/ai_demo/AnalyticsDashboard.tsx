"use client";
import React, { useEffect, useState } from "react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/ai/analytics');
        const j = await r.json();
        setData(j.analytics || j);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!data) return <div style={{ padding: 12 }}>Loading analytics…</div>;

  return (
    <div style={{ padding: 12 }}>
      <h4>Engagement Analytics</h4>
      <div>Snapshot: {data.snapshot_at}</div>
      <h5>Top Topics</h5>
      <ul>
        {data.topTopics.map((t: any, i: number) => <li key={i}>{t.name} — {t.score}</li>)}
      </ul>
      <h5>Groups</h5>
      <ul>
        {data.groups.map((g: any, i: number) => <li key={i}>{g.name} — members {g.members}</li>)}
      </ul>
    </div>
  );
}
