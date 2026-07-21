# JSON Schema – FUME Client Intelligence Output
## Version 1.0

This document describes the full JSON schema used to structure client intelligence output from the FUME conversation analysis pipeline.

---

## Top-Level Schema

```json
{
  "metadata": { ... },
  "weekly_summary": { ... },
  "dimensions": { ... },
  "key_barriers": [ ... ],
  "pending_actions": [ ... ],
  "risk_flags": [ ... ],
  "recommended_next_action": { ... },
  "day_tracker": [ ... ],
  "client_weight": { ... },
  "review": { ... }
}
```

---

## Field Definitions

### `metadata`

```json
{
  "client_id": "string — anonymised client identifier",
  "client_display_name": "string — display name (anonymised)",
  "coach_id": "string — coach identifier",
  "week_label": "string — human-readable week description, e.g. 'Week 1 (Day 1–8)'",
  "generated_at": "ISO 8601 datetime string",
  "source_file": "string — filename of the source conversation",
  "review_status": "enum: PENDING | APPROVED | REJECTED",
  "model_version": "string — analysis pipeline version"
}
```

---

### `weekly_summary`

```json
{
  "text": "string — 150-200 word narrative of the week",
  "confidence": "enum: HIGH | MEDIUM | LOW",
  "type": "enum: CONFIRMED | CLIENT_REPORTED | AI_INFERRED | MISSING",
  "evidence_refs": ["array of string keys referencing specific days or events"]
}
```

---

### `dimensions`

Each dimension follows this base schema:

```json
{
  "label": "string — display name",
  "score": "integer — 0 to 100",
  "score_max": 100,
  "score_label": "enum: Excellent | Good | Moderate | Poor | High Stress | Concerning",
  "summary": "string — dimension-level narrative",
  "highlights": [
    {
      "finding": "string — specific observation",
      "type": "enum: CONFIRMED | CLIENT_REPORTED | AI_INFERRED | MISSING",
      "severity": "enum: CRITICAL | HIGH | MEDIUM | LOW | POSITIVE",
      "evidence": "string — direct quote or paraphrase with Day N reference"
    }
  ]
}
```

**Available dimensions:**
- `nutrition` — includes `days_data` (per-day meal log)
- `exercise` — includes `steps_log` (per-day steps)
- `sleep` — includes `sleep_log`, `weekly_avg_known_days`, `weekly_avg_note`
- `water` — includes `water_log`
- `symptoms` — base schema only
- `stress_mood` — base schema only
- `engagement` — base schema only

---

### `key_barriers`

```json
[
  {
    "id": "string — e.g. B1, B2",
    "barrier": "string — description of the barrier",
    "type": "enum: CONFIRMED | CLIENT_REPORTED | AI_INFERRED | MISSING",
    "severity": "enum: CRITICAL | HIGH | MEDIUM | LOW",
    "impact": "string — how this barrier affects the wellness program",
    "evidence": "string — direct quote or paraphrase with Day N reference"
  }
]
```

---

### `pending_actions`

```json
[
  {
    "id": "string — e.g. PA1, PA2",
    "action": "string — what needs to be done",
    "owner": "enum: CLIENT | COACH | COACH + CLIENT",
    "due": "string — expected completion timeframe",
    "status": "enum: OPEN | IN_PROGRESS | COMPLETED | UNKNOWN",
    "source": "string — where the action commitment was made",
    "evidence": "string — direct quote or paraphrase"
  }
]
```

---

### `risk_flags`

```json
[
  {
    "id": "string — e.g. RF1",
    "flag": "string — description of the risk",
    "severity": "enum: CRITICAL | HIGH | MEDIUM | LOW",
    "type": "enum: CONFIRMED | CLIENT_REPORTED | AI_INFERRED | MISSING",
    "category": "enum: PHYSICAL_MENTAL_HEALTH | PHYSICAL_HEALTH | NUTRITION | SLEEP | ENGAGEMENT",
    "action_required": "string — specific action the coach should take",
    "evidence": "string — direct quote or paraphrase"
  }
]
```

---

### `recommended_next_action`

```json
{
  "primary": {
    "action": "string — the top recommended action",
    "rationale": "string — reasoning behind the recommendation",
    "type": "enum: AI_INFERRED (always)",
    "evidence": "string — evidence supporting the recommendation"
  },
  "secondary": [
    {
      "action": "string",
      "rationale": "string",
      "type": "AI_INFERRED",
      "evidence": "string"
    }
  ]
}
```

---

### `day_tracker`

```json
[
  {
    "day": "integer — 1 to N",
    "sleep": "number | null — hours of sleep, null if not reported",
    "water": "number | string | null — litres or 'Done' or null",
    "steps": "number | string | null — step count or null",
    "exercise": "string | null — description of exercise",
    "mood": "string | null — mood/energy description",
    "acv": "boolean | null — true=done, false=missed, null=not mentioned",
    "symptoms": ["array of symptom strings"]
  }
]
```

---

### `review`

```json
{
  "status": "enum: PENDING | APPROVED | REJECTED",
  "coach_notes": "string — coach's textual notes or corrections",
  "reviewed_by": "string | null — coach identifier",
  "reviewed_at": "ISO 8601 datetime | null"
}
```

---

## Enums Reference

| Field | Allowed Values |
|-------|---------------|
| `type` (information) | `CONFIRMED`, `CLIENT_REPORTED`, `AI_INFERRED`, `MISSING` |
| `severity` | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `POSITIVE` |
| `score_label` | `Excellent`, `Good`, `Moderate`, `Poor`, `High Stress`, `Concerning` |
| `review_status` | `PENDING`, `APPROVED`, `REJECTED` |
| `action_status` | `OPEN`, `IN_PROGRESS`, `COMPLETED`, `UNKNOWN` |
| `action_owner` | `CLIENT`, `COACH`, `COACH + CLIENT` |

---

## Validation Rules

1. `evidence` must be non-null for any finding with `type != MISSING`
2. `score` must be between 0 and 100 (integer)
3. `severity = CRITICAL` requires `action_required` in risk flags
4. All `review_status = PENDING` reports must show the AI disclaimer in the UI
5. `weekly_avg_known_days` must only average days where the metric was reported
