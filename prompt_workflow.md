# Prompt & Workflow Document
## FUME GenAI Client Intelligence Assignment

---

## 1. The Problem Being Solved

Given a raw WhatsApp-style client-coach wellness conversation (8 days), extract structured, evidence-grounded intelligence that a health coach can act on — distinguishing between what was confirmed, self-reported, AI-inferred, and missing.

---

## 2. Overall Workflow

```
Raw Conversation Text (Day 1.md)
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 1: Day Segmentation   │  Split conversation into Day 1–8 segments
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 2: Per-Day Extraction │  Extract metrics per day with type labels
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 3: Weekly Synthesis   │  Aggregate across days, identify patterns
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 4: Risk & Action Gen  │  Generate risk flags and recommendations
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 5: JSON Output        │  Structure as intelligence.json
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │   STEP 6: UI Rendering       │  Web app renders with evidence + review UI
  └──────────────────────────────┘
```

---

## 3. System Prompt (for LLM analysis)

```
You are a senior health coach analyst AI assistant embedded in the FUME client intelligence platform.

Your role is to analyse wellness coaching conversations and extract structured, actionable client intelligence.

CRITICAL RULES:
1. Never fabricate data. If a metric is not mentioned, mark it as MISSING.
2. Distinguish clearly between four information types:
   - CONFIRMED: Explicitly stated by client/coach with no ambiguity
   - CLIENT_REPORTED: Self-reported by client — may be estimated or subjective
   - AI_INFERRED: Derived by you from context, patterns, or implied information
   - MISSING: Not mentioned or clearly unavailable
3. Every finding MUST include an evidence citation — a direct quote or paraphrase from the original conversation.
4. Never use clinical language (e.g., "burnout", "anxiety disorder", "depression") for symptoms that are not clinically assessed. Use descriptive language instead.
5. Do not extrapolate trends from a single data point. Always note uncertainty.
6. When in doubt, label as MISSING rather than guessing.

Your output should be a valid JSON object matching the schema provided.
```

---

## 4. User Prompt Template

```
Analyse the following {N}-day wellness coaching conversation and generate a complete client intelligence report.

CONVERSATION:
---
{PASTE_CONVERSATION_HERE}
---

Extract the following for each day (where available):
- Sleep hours
- Water intake (litres or qualitative)
- Steps count
- Exercise type and duration
- Meals (breakfast, lunch, dinner)
- Symptoms (acidity, bloating, pain, fatigue, etc.)
- Mood and energy level
- ACV compliance
- Stress indicators

Then synthesise across all days to generate:
1. Weekly summary narrative (150–200 words)
2. Per-dimension scores (0–100) with label: Excellent / Good / Moderate / Poor / High Stress
3. Key findings per dimension with type labels and evidence quotes
4. Top 3–5 barriers with severity (CRITICAL/HIGH/MEDIUM/LOW)
5. All pending actions (from commitments made by client or coach)
6. Risk flags (severity: CRITICAL/HIGH/MEDIUM/LOW) with recommended actions
7. Primary and secondary coach recommendations
8. Engagement level score

IMPORTANT: For every finding, include:
- The exact type: CONFIRMED | CLIENT_REPORTED | AI_INFERRED | MISSING
- An evidence string (direct quote or precise paraphrase with day reference)

Return valid JSON matching the provided schema.
```

---

## 5. Post-Processing Rules

After the LLM response, apply these validation rules before storing:

| Rule | Check |
|------|-------|
| No metric presented as CONFIRMED without an explicit quote | Scan for CONFIRMED fields, verify evidence exists |
| No score above 80 for a dimension with MISSING data gaps > 50% | Score penalty for missing data |
| No clinical diagnosis terms | Regex scan for banned terms |
| Evidence must contain a day reference (Day N) | Validate evidence strings |
| Risk flags must have action_required field | Schema validation |

---

## 6. Few-Shot Example (Evidence Citation Format)

**Input excerpt:**
> Day 7 – Client: "During a meeting today I was so tired that my head went down on the table and I actually slept for a few seconds."

**Correct output:**
```json
{
  "flag": "Client experienced involuntary sleep during a work meeting — possible acute fatigue",
  "type": "CLIENT_REPORTED",
  "severity": "CRITICAL",
  "evidence": "Day 7 – Client: 'During a meeting today I was so tired that my head went down on the table and I actually slept for a few seconds.'"
}
```

**Incorrect output (hallucination risk):**
```json
{
  "flag": "Client diagnosed with burnout syndrome",
  "type": "CONFIRMED",
  "severity": "CRITICAL",
  "evidence": null
}
```

---

## 7. Information Type Decision Tree

```
Was the information explicitly stated in the conversation?
├── YES → Is it stated by the coach with certainty? → CONFIRMED
│         Is it stated by the client as self-measurement? → CLIENT_REPORTED
└── NO  → Can it be logically derived from context? → AI_INFERRED
           Is there no basis to derive it? → MISSING
```

---

## 8. Hallucination Prevention Mechanisms

1. **Evidence-first policy**: Every JSON field with a finding must have a non-null `evidence` string
2. **MISSING as valid state**: The schema explicitly allows and requires MISSING labels — no field is ever left blank
3. **Type badges in UI**: Every displayed finding shows its type prominently — making AI inference transparent to the coach
4. **Human review gate**: All reports require Approve/Edit/Reject before being used for clinical decisions
5. **No averages from sparse data**: Averages are computed only from known data points and labelled with "known days only"
