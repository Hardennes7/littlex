"use client";
import React, { useEffect, useState } from "react";

export default function CommunityPanel({ profile }: { profile?: string }) {
  const [recs, setRecs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`/api/ai/recommendations?profile_jid=${encodeURIComponent(profile||'')}`);
        const j = await r.json();
        setRecs(j.recommendations || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [profile]);

  return (
    <div style={{ padding: 12 }}>
      <h4>Community Recommendations</h4>
      <ul>
        {recs.map((g: any) => (
          <li key={g.id}>
            <strong>{g.name}</strong> — members: {g.members}
          </li>
        ))}
      </ul>
    </div>
  );
}
