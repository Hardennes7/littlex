"use client";
import React, { useEffect, useState } from "react";

export default function TrendingSidebar() {
  const [trends, setTrends] = useState<Array<any>>([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/ai/trending");
        const j = await r.json();
        setTrends(j.trends || j.trending || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <aside style={{ padding: 12, borderLeft: "1px solid #eee" }}>
      <h3>Trending Topics</h3>
      <ul>
        {trends.map((t: any, i: number) => (
          <li key={i}>
            <strong>{t.topic || t.name}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>{t.score ? `score ${t.score}` : t.growth}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
