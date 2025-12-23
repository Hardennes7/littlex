'use client';
import { useState } from 'react';
import { jac } from './utils/jac'; // Import the new Jac connection

export default function AIDemo() {
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHype = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setAiResponse('');

    try {
      // 1. CALL THE BACKEND
      // We are asking the 'interact' walker to run with your message.
      // (Note: If your walker in start.jac is named differently, change 'interact' below)
      const result = await jac.run('interact', { message: inputText });

      // 2. PROCESS THE RESULT
      // Jaseci usually returns a report. We grab the first item.
      // If the result is an object, we turn it into text.
      let outputText = 'No response received.';
      
      if (result && typeof result === 'object' && result.report) {
         outputText = result.report[0] || JSON.stringify(result);
      } else if (result) {
         outputText = JSON.stringify(result);
      }

      setAiResponse(outputText);
      
    } catch (error) {
      console.error('Jac Connection Failed:', error);
      setAiResponse('?? Error: Could not connect to Jaseci Backend. Is it running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
      <h1>? LittleX AI Playground</h1>
      <p>Test the <b>Hype Man</b> agent (Powered by Jaseci).</p>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder='Type a sentence here...'
        style={{ width: '100%', height: '100px', padding: '10px', marginTop: '20px', color: 'black' }}
      />

      <br />

      <button
        onClick={handleHype}
        disabled={loading}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'AI is thinking...' : '?? Hype It Up!'}
      </button>

      {aiResponse && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#222', borderRadius: '8px', border: '1px solid #444' }}>        
          <h3>AI Suggestion:</h3>
          <p style={{ fontSize: '1.2em', color: '#00ff88' }}>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}
