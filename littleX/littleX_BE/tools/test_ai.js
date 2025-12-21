const ai = require('../app/ai');
(async () => {
  const out = await ai.generateHype({ prompt: 'Quick test of AI hype', style: 'viral' });
  console.log('OUT:', out);
  const sum = await ai.summarizeThread({ messages: ['hello world', 'this is a follow up'] });
  console.log('SUM:', sum);
})();
