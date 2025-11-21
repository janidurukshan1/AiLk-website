// server/index.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // or use openai official client
const app = express();
app.use(express.json());
app.use(require('cors')());

// simple health
app.get('/api/health', (req,res) => res.json({ ok: true }));

// POST /api/chat { message: "..." }
app.post('/api/chat', async (req,res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });
  try {
    // Using OpenAI REST call to chat completions (example)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI key not configured' });

    // Example using gpt-4o-mini or gpt-4o; change model as you like
    const payload = {
      model: 'gpt-4o-mini', // pick an available model in your account
      messages: [
        { role: 'system', content: 'You are AiLK assistant. Answer concisely and helpfully.' },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      max_tokens: 600
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok) return res.status(500).json({ error: j });

    // extract reply
    const reply = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('AiLK server listening on', port));
