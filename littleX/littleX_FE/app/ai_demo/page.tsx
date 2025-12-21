import React from 'react';
import AIWritingAssistant from './AIWritingAssistant';
import TrendingSidebar from './TrendingSidebar';
import SmartReply from './SmartReply';
import ThreadNavigator from './ThreadNavigator';
import CommunityPanel from './CommunityPanel';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function Page() {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <main style={{ flex: 3 }}>
        <AIWritingAssistant />
        <SmartReply message={'I think AI will reshape our social feeds.'} />
        <ThreadNavigator />
      </main>
      <aside style={{ flex: 1 }}>
        <TrendingSidebar />
        <CommunityPanel profile={'user_001'} />
        <AnalyticsDashboard />
      </aside>
    </div>
  );
}
"use client";
import AIWritingAssistant from "./AIWritingAssistant";
import TrendingSidebar from "./TrendingSidebar";

export default function AIDemo() {
  return (
    <div style={{ display: "flex", gap: 24, padding: 24 }}>
      <main style={{ flex: 1, maxWidth: 800 }}>
        <h1>✨ LittleX AI Playground</h1>
        <AIWritingAssistant />
      </main>
      <aside style={{ width: 280 }}>
        <TrendingSidebar />
      </aside>
    </div>
  );
}