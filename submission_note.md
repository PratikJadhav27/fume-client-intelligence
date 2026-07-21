# Submission Note
## FUME GenAI Product Intern Assignment

**Candidate:** Pratik
**Assignment:** GenAI Client Intelligence Mini-Case

---

## What I Built

I built a **single-page web application** — the FUME Client Intelligence Dashboard — that analyses an 8-day wellness coaching conversation and generates structured, evidence-grounded client intelligence.

The prototype consists of four files:
- `index.html` — the app shell with sidebar navigation and section containers
- `style.css` — a premium dark-mode design system (glassmorphism, animated score rings, badge system)
- `app.js` — the rendering engine that loads and visualises the intelligence data
- `intelligence.json` — the structured analysis output (pre-computed from the conversation)

**How it works:**
1. The conversation (`Day 1.md`) is analysed and converted into `intelligence.json` using a documented prompt workflow
2. The web app loads this JSON and renders 11 distinct sections: Weekly Summary, Nutrition, Exercise, Sleep, Water, Symptoms, Stress & Mood, Key Barriers, Pending Actions, Risk Flags, and Recommended Actions
3. Every finding is labelled with its **information type** (Confirmed / Client-Reported / AI Inferred / Missing) and includes expandable **evidence panels** showing the exact source message
4. A **Coach Review panel** allows the coach to Approve, Edit (with notes), or Reject the report before acting on it

---

## Key Assumptions

1. **The conversation represents one client, one coach** — I treated all messages as a linear single-client thread. In production, multi-client support would require message-level attribution.

2. **No baseline data** — There is no prior health history, baseline weight, or target metrics. Scores and recommendations are relative to the week's own data, not to a clinical benchmark.

3. **Self-reported accuracy** — All client-reported data (sleep, steps, water) are taken at face value. In a real system, wearable integration would provide objective validation.

4. **Day 8 is the recovery reference point** — The significant improvement on Day 8 (after 8 hours sleep) is treated as empirical evidence that sleep is the highest-leverage intervention — this is an AI inference, not a clinical conclusion.

5. **Conversation completeness** — Only one file was available (`Day 1.md` covering 8 days). In a production system, historical context across weeks would significantly improve the quality of inference.

---

## What Could Go Wrong

### 1. Hallucinated Metrics (High Risk)
**Scenario:** The LLM reports water intake of "3 litres" on Day 4 when no water was mentioned.
**Why it happens:** LLMs are trained to produce complete-looking outputs. Missing fields create pressure to fill in plausible values.
**Mitigation:** Explicit `MISSING` enum label in the schema; validation rule rejecting any CONFIRMED metric without an evidence string; UI renders `—` instead of a blank for missing data.

### 2. False Precision on Weight Trend (Medium Risk)
**Scenario:** The model infers "the client gained 2kg this week" from Day 5's "weight feels slightly up" and Day 8's "83kg."
**Why it happens:** The model calculates a delta from two data points — but there's no Day 1 weight, so no baseline exists for comparison.
**Mitigation:** Weight trend is labelled UNKNOWN in the schema. The UI shows only the reported absolute value (83 kg) with a note that baseline is unavailable.

### 3. Stress Misattribution / Over-Inference (High Risk)
**Scenario:** The Day 7 stress incident (falling asleep in a meeting) is labelled as "burnout syndrome" or "clinical anxiety."
**Why it happens:** LLMs tend to apply medical-sounding labels to match the severity of input symptoms.
**Mitigation:** System prompt explicitly prohibits clinical diagnostic language. The risk flag says "possible acute fatigue" (descriptive) not "burnout" (diagnostic). Labelled `CLIENT_REPORTED` and `AI_INFERRED` to signal this requires professional evaluation.

---

## What I Would Improve Next

### Week 2+ (with more time)
1. **Live LLM integration** — Replace pre-computed JSON with a real-time API call to Gemini or GPT-4o, using the documented prompt workflow. This allows the system to work with any conversation file.

2. **Multi-client dashboard** — Add a client list view, weekly comparison charts, and the ability to track progress across weeks (weight, sleep, steps trends over 4–12 weeks).

3. **Wearable sync** — Integrate Google Fit / Apple Health / Fitbit APIs to replace self-reported steps and sleep with objective device data, dramatically reducing CLIENT_REPORTED uncertainty.

4. **Inline edit confirmation** — Currently the review panel allows the coach to add notes. Next step: allow field-level corrections ("the client's water was actually 2.5L on Day 4") with a proper diff-view before saving.

5. **Automated follow-up suggestions** — Turn pending actions into calendar events or WhatsApp message drafts, reducing the coach's administrative load.

6. **Confidence calibration** — Add a confidence interval display (e.g., "Sleep avg: 5.9h ± 1.5h") based on data density, so coaches understand uncertainty quantitatively.

---

## Tools Used
- Analysis: Claude (for conversation analysis and JSON generation)
- Development: Antigravity (AI coding assistant built on Google DeepMind) using VS Code
- Design: Custom CSS (no frameworks — for maximum control and performance)
- No external APIs required to run the prototype
