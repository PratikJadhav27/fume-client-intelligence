// Netlify Serverless Function — FUME Conversation Analyser
// Securely proxies the Gemini API. API key never reaches the browser.
// Uses native fetch (Node 18+), no npm packages needed.

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a senior health coach analyst AI embedded in the FUME client intelligence platform.

Your role: analyse a wellness coaching conversation and return a structured JSON intelligence report.

CRITICAL RULES:
1. NEVER fabricate data. If a metric is not mentioned, mark it MISSING.
2. Every finding MUST include an evidence citation — a direct quote or precise paraphrase with a Day reference (e.g. "Day 3 – Client: '...'").
3. Distinguish between four information types:
   - CONFIRMED: Explicitly stated, unambiguous
   - CLIENT_REPORTED: Self-reported by the client — may be estimated
   - AI_INFERRED: Derived by you from context or patterns
   - MISSING: Not mentioned or unavailable
4. NEVER use clinical diagnostic language (e.g. "burnout", "anxiety disorder", "depression"). Use descriptive language only.
5. Do not extrapolate trends from a single data point.
6. When in doubt, label MISSING rather than guessing.
7. Scores are 0–100. Penalise scores for dimensions with >50% missing data.

OUTPUT: Return ONLY a valid JSON object. No markdown, no explanation, no code fences. Just the JSON.

REQUIRED JSON SCHEMA:
{
  "metadata": {
    "client_id": "CLIENT_001",
    "client_display_name": "Anonymous Client",
    "coach_id": "COACH_001",
    "week_label": "Week 1",
    "generated_at": "<ISO timestamp>",
    "source_file": "uploaded_conversation",
    "review_status": "PENDING",
    "model_version": "gemini-live-v1"
  },
  "weekly_summary": {
    "text": "<150-200 word narrative>",
    "confidence": "HIGH|MEDIUM|LOW",
    "type": "AI_INFERRED",
    "evidence_refs": []
  },
  "dimensions": {
    "nutrition": {
      "label": "Nutrition Adherence",
      "score": <0-100>,
      "score_max": 100,
      "score_label": "Excellent|Good|Moderate|Poor",
      "summary": "<summary>",
      "confidence": { "score": <0-100>, "label": "<label>", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "CONFIRMED|CLIENT_REPORTED|AI_INFERRED|MISSING", "severity": "CRITICAL|HIGH|MEDIUM|LOW|POSITIVE", "evidence": "" }]
    },
    "exercise": {
      "label": "Exercise / Steps",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }],
      "steps_log": { "day1": { "value": null, "label": "MISSING", "type": "MISSING" } }
    },
    "sleep": {
      "label": "Sleep",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n>, "std_dev": <number> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }],
      "sleep_log": { "day1": { "hours": null, "type": "MISSING" } },
      "weekly_avg_known_days": <number>,
      "weekly_avg_note": ""
    },
    "water": {
      "label": "Water Intake",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }],
      "water_log": { "day1": { "litres": null, "type": "MISSING" } }
    },
    "symptoms": {
      "label": "Symptoms",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }]
    },
    "stress_mood": {
      "label": "Stress & Mood",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }]
    },
    "engagement": {
      "label": "Engagement",
      "score": <0-100>, "score_max": 100, "score_label": "",
      "summary": "",
      "confidence": { "score": <0-100>, "label": "", "reported_days": <n>, "total_days": <n> },
      "highlights": [{ "finding": "", "type": "", "severity": "", "evidence": "" }]
    }
  },
  "key_barriers": [{ "barrier": "", "type": "", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "evidence": "" }],
  "pending_actions": [{ "action": "", "owner": "CLIENT|COACH", "due": "", "status": "OPEN", "type": "", "evidence": "" }],
  "risk_flags": [{ "flag": "", "type": "", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "action_required": "", "evidence": "" }],
  "recommended_next_action": {
    "primary": { "action": "", "rationale": "", "type": "AI_INFERRED", "evidence": "" },
    "secondary": [{ "action": "", "rationale": "", "type": "", "evidence": "" }]
  },
  "day_tracker": [
    { "day": 1, "sleep": null, "water": null, "steps": null, "exercise": "", "mood": "", "acv": null, "symptoms": [] }
  ]
}`;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured in Netlify environment variables.' }) };
  }

  let conversationText;
  try {
    const body = JSON.parse(event.body);
    conversationText = body.conversation_text;
    if (!conversationText || conversationText.trim().length < 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Conversation text is too short or missing.' }) };
    }
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const fullPrompt = `${SYSTEM_PROMPT}

Now analyse this conversation:

---CONVERSATION START---
${conversationText}
---CONVERSATION END---

Return ONLY the JSON object. No extra text.`;

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, detail: errBody }) };
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Empty response from Gemini.' }) };
    }

    // Strip any accidental markdown fences
    const clean = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    // Validate it's parseable JSON before returning
    JSON.parse(clean);

    return { statusCode: 200, headers, body: clean };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error', detail: err.message }) };
  }
};
