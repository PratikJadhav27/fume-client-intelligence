/* ============================================================
   FUME Client Intelligence Platform – app.js
   Data is embedded inline so the app works as a plain file://
   URL without needing a local server.
   ============================================================ */

let DATA = null;
let reviewState = { status: 'PENDING', notes: '', reviewedAt: null };
let isLiveData = false; // true when data came from Gemini, not embedded

// ─── EMBEDDED DATA (from intelligence.json) ──────────────────
const EMBEDDED_DATA = {"metadata":{"client_id":"CLIENT_001","client_display_name":"Anonymous Client","coach_id":"COACH_001","week_label":"Week 1 (Day 1 – Day 8)","generated_at":"2026-07-21T10:00:00Z","source_file":"Day 1.md","review_status":"PENDING","model_version":"analysis-v1.0"},"weekly_summary":{"text":"The client completed her first week of wellness coaching while managing a demanding dual role as a school teacher and household caregiver. Sleep was consistently below 7 hours (avg ~5.5 hrs) across most days, with one recovery night of 8 hours on Day 8. Persistent digestive symptoms (acidity, bloating) were present through most of the week. A critical stress incident on Day 7 — where the client fell asleep during a work meeting — represents the highest-severity risk flag of the week. The week ended on a positive note with improved sleep, energy, and 30 minutes of structured exercise on Day 8. Key challenges remain: inconsistent meals due to school schedule, low protein intake, and chronic sleep deprivation.","confidence":"HIGH","type":"AI_INFERRED","evidence_refs":["D1_ALL","D7_STRESS","D8_ALL"]},"dimensions":{"nutrition":{"label":"Nutrition Adherence","score":55,"score_max":100,"score_label":"Moderate","summary":"Meals were generally light and vegetarian but lacked consistent protein, especially at breakfast. Salad before meals was skipped on Day 1. ACV was forgotten on Day 3 and completed on Day 4. Evening meals were sometimes very light or skipped (Day 2: only a small piece of paneer). The client acknowledged not having enough time for meal planning due to school schedule.","highlights":[{"finding":"Salad before lunch not done on Day 1 due to insufficient vegetable stock","type":"CONFIRMED","severity":"LOW","evidence":"Day 1 – Client: 'No. I still need to stock vegetables properly. Will do it tomorrow.'"},{"finding":"Evening meal very light on Day 2 (only a small piece of paneer) — coach flagged meal-skipping risk","type":"CONFIRMED","severity":"MEDIUM","evidence":"Day 2 – Client: 'Didn't eat much in the evening. Just a small piece of paneer.' Coach: 'Please don't skip meals completely. Try to keep the meals simple.'"},{"finding":"ACV compliance: missed Day 3, completed Day 4","type":"CONFIRMED","severity":"LOW","evidence":"Day 3 – Client: 'Forgot ACV today. Not yet in the habit.' | Day 4 – Client: 'ACV done today.'"},{"finding":"Protein consistently low at breakfast across multiple days","type":"AI_INFERRED","severity":"MEDIUM","evidence":"Day 5 – Coach: 'Protein seems low in breakfast on some days.' Client: 'I didn't have sprouts today.' Day 6 – Coach: 'Protein was also missing.'"},{"finding":"Meal planning is a core barrier — client explicitly stated she does not have enough time","type":"CLIENT_REPORTED","severity":"HIGH","evidence":"Day 6 – Client: 'I am not getting enough time to plan meals. Next week should be easier.'"},{"finding":"Client reported eating 'almost half' of usual intake on Day 5 — restricting excessively","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 5 – Client: 'Weight seems slightly up even though I'm eating almost half of what I used to eat.'"}],"days_data":{"day1":{"breakfast":"Tea + soaked nuts","lunch":"Kadhi with soya + green vegetables","dinner":"MISSING","type":"CLIENT_REPORTED"},"day2":{"breakfast":"Tea (1 cup) + 1 apple","lunch":"MISSING","dinner":"Small piece of paneer","type":"CLIENT_REPORTED"},"day3":{"breakfast":"Coconut water + tea + prunes + seeds","lunch":"Vegetables + curd + some protein (vague)","dinner":"MISSING","type":"CLIENT_REPORTED"},"day4":{"breakfast":"1.5 vegetable chapatis + seeds + ajwain + tea","lunch":"Carried to school (details unknown)","dinner":"MISSING","type":"CLIENT_REPORTED"},"day5":{"breakfast":"No sprouts (ordered)","lunch":"Roasted chana at school","dinner":"MISSING","type":"CLIENT_REPORTED"},"day6":{"breakfast":"MISSING","lunch":"Roasted chana + kala chana","dinner":"MISSING","type":"CLIENT_REPORTED"},"day7":{"breakfast":"Okay (vague)","lunch":"Okay (vague)","dinner":"MISSING","type":"CLIENT_REPORTED"},"day8":{"breakfast":"MISSING","lunch":"MISSING","dinner":"MISSING","type":"MISSING"}}},"exercise":{"label":"Exercise / Steps","score":62,"score_max":100,"score_label":"Good","summary":"Exercise was consistent, though often light (household chores, walking). Structured exercise increased from the beginning — Day 4 had 20 min walk+stretch+breathing, Day 5 had 20 min stretch+running, Day 8 had 30 min exercise. Steps were reported on some days only.","highlights":[{"finding":"Day 8 had the best exercise session: 30 minutes structured movement","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 8 – Client: 'Did 30 minutes exercise.'"},{"finding":"Day 1 post-meal walk of 15 minutes — good habit maintained","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 1 – Coach: 'Did you walk after meals?' Client: 'Yes, around 15 minutes.'"},{"finding":"Surya Namaskar practiced on Day 1 — good incorporation of structured exercise","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 1 – Client: 'Did some mopping, sweeping, Surya Namaskar and walking inside the house.'"}],"steps_log":{"day1":{"value":null,"label":"MISSING","type":"MISSING"},"day2":{"value":null,"label":"MISSING","type":"MISSING"},"day3":{"value":8000,"label":"~8,000","type":"CLIENT_REPORTED"},"day4":{"value":4500,"label":"4,500 (partial day)","type":"CLIENT_REPORTED"},"day5":{"value":null,"label":"MISSING","type":"MISSING"},"day6":{"value":null,"label":"MISSING","type":"MISSING"},"day7":{"value":6000,"label":"6,000","type":"CLIENT_REPORTED"},"day8":{"value":8000,"label":"~8,000","type":"CLIENT_REPORTED"}}},"sleep":{"label":"Sleep","score":40,"score_max":100,"score_label":"Poor","summary":"Sleep was chronically insufficient across the week — mostly around 5 hours per night. Causes included caregiving responsibilities (daughter's exams on Day 1), work stress, and late working habits. Day 8 showed a significant recovery (8 hours), which correlated with much better energy. Chronic sleep deprivation is a primary contributor to fatigue, low energy, and potentially digestive symptoms.","highlights":[{"finding":"Day 1: 5 hours sleep due to daughter's exam night","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 1 – Client: 'Slept only around 5 hours last night. Daughter had exams, so I was awake late.'"},{"finding":"Day 3: 5 hours sleep","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 3 – Accountability Coach update: 'Sleep 5 hours'"},{"finding":"Day 7: 5.5 hours sleep with extreme daytime fatigue","type":"CLIENT_REPORTED","severity":"HIGH","evidence":"Day 7 – Client: 'Sleep around 5.5 hours.' + 'During a meeting today I was so tired that my head went down on the table and I actually slept for a few seconds.'"},{"finding":"Day 8: 8 hours sleep — full recovery night, significantly improved energy","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 8 – Client: 'Slept better last night, around 8 hours. Energy feels much better today.'"},{"finding":"Sleep data missing for Days 2, 4, 5, 6","type":"MISSING","severity":"LOW","evidence":"No sleep data reported on these days."}],"sleep_log":{"day1":{"hours":5,"type":"CLIENT_REPORTED"},"day2":{"hours":null,"type":"MISSING"},"day3":{"hours":5,"type":"CLIENT_REPORTED"},"day4":{"hours":null,"type":"MISSING"},"day5":{"hours":null,"type":"MISSING"},"day6":{"hours":null,"type":"MISSING"},"day7":{"hours":5.5,"type":"CLIENT_REPORTED"},"day8":{"hours":8,"type":"CLIENT_REPORTED"}},"weekly_avg_known_days":5.9,"weekly_avg_note":"Average calculated only from reported days (Days 1, 3, 7, 8). Actual average may differ."},"water":{"label":"Water Intake","score":55,"score_max":100,"score_label":"Moderate","summary":"Water was confirmed on Day 2 (vague), Day 3 (4 litres), Day 8 (3.5 litres). Other days had no water intake data reported. The client acknowledged completing water on Day 2 but without a quantity.","highlights":[{"finding":"Day 3: 4 litres — good hydration","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 3 – Accountability Coach: 'Water 4 litres'"},{"finding":"Day 8: 3.5 litres — adequate hydration","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 8 – Client: 'Water around 3.5 litres.'"},{"finding":"Day 2: water done but quantity unknown","type":"CLIENT_REPORTED","severity":"LOW","evidence":"Day 2 – Client: 'Walk and water done.'"},{"finding":"Water data missing for Days 1, 4, 5, 6, 7","type":"MISSING","severity":"MEDIUM","evidence":"No water intake mentioned on these days."}],"water_log":{"day1":{"litres":null,"type":"MISSING"},"day2":{"litres":null,"confirmed":true,"label":"Done (qty unknown)","type":"CLIENT_REPORTED"},"day3":{"litres":4,"type":"CLIENT_REPORTED"},"day4":{"litres":null,"type":"MISSING"},"day5":{"litres":null,"type":"MISSING"},"day6":{"litres":null,"type":"MISSING"},"day7":{"litres":null,"type":"MISSING"},"day8":{"litres":3.5,"type":"CLIENT_REPORTED"}}},"symptoms":{"label":"Symptoms","score":35,"score_max":100,"score_label":"Concerning","summary":"Acidity started on Day 1 (attributed to late sleep and heavy work, not food). Bloating appeared on Day 2 and recurred on Day 6 and Day 8. Weight was reported as feeling 'slightly up' on Day 5. These digestive symptoms appear to be linked to irregular meal timing, meal skipping, and chronic sleep deprivation rather than any specific food item.","highlights":[{"finding":"Acidity present since Day 1 morning — attributed to late sleep and overwork, not food","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 1 – Client: 'Feeling some acidity since morning.' Coach: 'Did it start after eating something?' Client: 'No. Slept very late and did a lot of work today. Got up with acidity.'"},{"finding":"Bloating reported on Day 2 alongside acidity","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 2 – Client: 'Still having acidity and bloating.'"},{"finding":"Bloating returned on Day 6 with low energy","type":"CLIENT_REPORTED","severity":"MEDIUM","evidence":"Day 6 – Client: 'Bloating is back and I feel like I have gained weight.'"},{"finding":"Bloating persists on Day 8 despite overall improvement","type":"CLIENT_REPORTED","severity":"LOW","evidence":"Day 8 – Client: 'Still having bloating on and off.'"},{"finding":"AI Inference: Bloating and acidity may be linked to irregular meal timing, light evening meals, and sleep deprivation — not an isolated dietary issue","type":"AI_INFERRED","severity":"MEDIUM","evidence":"Pattern across Days 1–8: acidity on Day 1 (late sleep), bloating Day 2 (light dinner), recurrence Day 6 (skipped meals), persistence Day 8 (ongoing)"}]},"stress_mood":{"label":"Stress & Mood","score":35,"score_max":100,"score_label":"High Stress","summary":"The week started positively (Day 1: 'generally feeling happy'). Stress escalated sharply on Day 7 due to work pressure and office politics, resulting in extreme fatigue (falling asleep in a meeting). Day 8 showed recovery after better sleep. Stress appears to be a significant and underaddressed factor in the client's overall wellness journey.","highlights":[{"finding":"Day 1: Client reported feeling happy overall","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 1 – Client: 'Generally feeling happy today.'"},{"finding":"Day 6: Energy very low, bloating back — likely linked to accumulated stress and poor sleep","type":"AI_INFERRED","severity":"MEDIUM","evidence":"Day 6 – Client: 'Yesterday energy was very good. Today feeling low again. Bloating is back.'"},{"finding":"Day 7: Office politics and pressure causing extreme fatigue — CRITICAL","type":"CLIENT_REPORTED","severity":"CRITICAL","evidence":"Day 7 – Client: 'There is a lot of office pressure and politics going on.' + 'During a meeting today I was so tired that my head went down on the table and I actually slept for a few seconds.' + 'Feeling very low.' + 'I feel I can sleep for days.'"},{"finding":"Day 8: Recovery — energy much better after full night of sleep","type":"CLIENT_REPORTED","severity":"POSITIVE","evidence":"Day 8 – Client: 'Energy feels much better today. Overall energy is much better than before.'"}]},"engagement":{"label":"Engagement Level","score":78,"score_max":100,"score_label":"High","summary":"The client engaged daily with the coach, shared detailed updates, responded to questions promptly, and acknowledged areas for improvement without defensiveness. She also asked food-related questions proactively (banana stem juice on Day 2). Only one missed call (Day 7, explained by work stress). Engagement is a key strength and a strong predictor of program success.","highlights":[{"finding":"Client actively shared daily updates across all 8 days","type":"CONFIRMED","severity":"POSITIVE","evidence":"Consistent messages across Day 1 to Day 8"},{"finding":"Client proactively asked about food choices (banana stem juice on Day 2)","type":"CONFIRMED","severity":"POSITIVE","evidence":"Day 2 – Client: 'Can I have banana stem, mint and ginger juice?'"},{"finding":"Client missed one coach call on Day 7 but explained reason","type":"CONFIRMED","severity":"LOW","evidence":"Day 7 – Client: 'Sorry I missed your call. There was a stressful situation at work.'"},{"finding":"Client acknowledged habit gaps without defensiveness (ACV, salad, meal planning)","type":"AI_INFERRED","severity":"POSITIVE","evidence":"Multiple instances: Day 3 (forgot ACV), Day 1 (no salad), Day 6 (time constraints for meal planning)"}]}},"key_barriers":[{"id":"B1","barrier":"Chronic sleep deprivation (avg ~5.5 hrs/night on known days)","type":"CLIENT_REPORTED","severity":"HIGH","impact":"Directly linked to acidity, bloating, low energy, and work fatigue. Sleep on Day 8 (8 hrs) was the single biggest driver of positive outcomes.","evidence":"Day 1: 5 hrs; Day 3: 5 hrs; Day 7: 5.5 hrs; Day 8: 8 hrs. Coach Day 7: 'We also need to look at your sleep and stress more carefully.'"},{"id":"B2","barrier":"School schedule disrupting meal planning and timing","type":"CLIENT_REPORTED","severity":"HIGH","impact":"Client returned to school on Day 3 with very hectic mornings — breakfast became inadequate. Meal prep time is limited during school days.","evidence":"Day 3: 'Very hectic morning. I didn't get time.' | Day 6: 'I am not getting enough time to plan meals.' | Coach Day 3: 'Slowly we need to adjust the routine around your school schedule also.'"},{"id":"B3","barrier":"Work stress (office politics, pressure) — emerging mental health concern","type":"CLIENT_REPORTED","severity":"CRITICAL","impact":"Work stress peaked on Day 7, causing severe fatigue and emotional distress. This is outside the typical nutrition/fitness scope but significantly impacts the program.","evidence":"Day 7: 'There is a lot of office pressure and politics going on.' + 'I actually slept for a few seconds during a meeting.' + 'Feeling very low. I feel I can sleep for days.'"},{"id":"B4","barrier":"Insufficient protein intake at breakfast","type":"AI_INFERRED","severity":"MEDIUM","impact":"Coach flagged protein gaps on Day 5. Low protein may contribute to energy dips, weight frustration, and inadequate satiety.","evidence":"Day 5 – Coach: 'Protein seems low in breakfast on some days.' | Day 6 – Coach: 'Food intake was low today. Protein was also missing.'"}],"pending_actions":[{"id":"PA1","action":"Set reminder for ACV around meal timings","owner":"CLIENT","due":"Day 9 onwards","status":"IN_PROGRESS","source":"Coach instruction Day 3","evidence":"Day 3 – Coach: 'Set a reminder around meal timings.' Client: 'Yes, will do.'"},{"id":"PA2","action":"Stock vegetables at home for salads","owner":"CLIENT","due":"Day 2 (overdue — not confirmed completed)","status":"UNKNOWN","source":"Client self-commitment Day 1","evidence":"Day 1 – Client: 'I still need to stock vegetables properly. Will do it tomorrow.'"},{"id":"PA3","action":"Order and start using sprouts for breakfast protein","owner":"CLIENT","due":"Day 6+","status":"IN_PROGRESS","source":"Client Day 5","evidence":"Day 5 – Client: 'I didn't have sprouts today. Have ordered them.'"},{"id":"PA4","action":"Adjust meal routine around school schedule","owner":"COACH + CLIENT","due":"Ongoing","status":"OPEN","source":"Coach Day 3","evidence":"Day 3 – Coach: 'Slowly we need to adjust the routine around your school schedule also.'"},{"id":"PA5","action":"Address sleep and stress as primary intervention points","owner":"COACH","due":"Immediately","status":"OPEN","source":"Coach Day 7","evidence":"Day 7 – Coach: 'Please rest today. We also need to look at your sleep and stress more carefully.'"}],"risk_flags":[{"id":"RF1","flag":"Client fell asleep during a work meeting on Day 7 — possible acute fatigue or burnout symptom","severity":"CRITICAL","type":"CLIENT_REPORTED","category":"PHYSICAL_MENTAL_HEALTH","action_required":"Coach should have a dedicated 1:1 conversation about stress levels and consider referral to mental health support if symptoms persist.","evidence":"Day 7 – Client: 'During a meeting today I was so tired that my head went down on the table and I actually slept for a few seconds.' + 'I feel I can sleep for days.'"},{"id":"RF2","flag":"Persistent digestive symptoms (acidity + bloating) across 7 of 8 days — may indicate underlying GI issue","severity":"HIGH","type":"CLIENT_REPORTED","category":"PHYSICAL_HEALTH","action_required":"If bloating and acidity persist beyond Week 2, recommend consulting a physician to rule out GI conditions.","evidence":"Day 1: acidity | Day 2: acidity + bloating | Day 6: bloating back | Day 8: bloating on and off"},{"id":"RF3","flag":"Possible food restriction — client eating 'almost half' of usual intake and experiencing weight frustration","severity":"MEDIUM","type":"CLIENT_REPORTED","category":"NUTRITION","action_required":"Reinforce that caloric restriction without adequate protein will slow metabolism and cause muscle loss. Reframe weight as a lagging indicator.","evidence":"Day 5 – Client: 'Weight seems slightly up even though I'm eating almost half of what I used to eat.' Coach: 'It is not always about eating less. Your body needs adequate nutrition.'"},{"id":"RF4","flag":"Sleep consistently below 6 hours on most reported days — chronic deprivation threshold","severity":"HIGH","type":"AI_INFERRED","category":"SLEEP","action_required":"Sleep hygiene protocol needed. Consider discussing daughter's exam schedule, work hours, and a hard cutoff time for screens/work.","evidence":"Day 1: 5 hrs; Day 3: 5 hrs; Day 7: 5.5 hrs. Pattern suggests structural barriers to adequate sleep."}],"recommended_next_action":{"primary":{"action":"Schedule a dedicated 15-minute stress and sleep check-in with the client before the next week begins","rationale":"Day 7's extreme fatigue incident (sleeping during a meeting) combined with chronic 5-hour sleep nights indicates the client's current load is unsustainable. Nutrition coaching alone will be insufficient if the underlying stress and sleep deficits are not addressed. This week's positive Day 8 outcome (8 hrs sleep → much better energy) empirically proves that sleep is the highest-leverage intervention for this client.","type":"AI_INFERRED","evidence":"Day 7 – Client: 'I feel I can sleep for days.' | Day 8 – Client: 'Slept better last night, around 8 hours. Energy feels much better today.'"},"secondary":[{"action":"Create a simplified 3-day school-day meal template for the client to reduce cognitive load in meal planning","rationale":"Client explicitly stated time for meal planning is the main barrier. A pre-planned template removes the decision-making effort.","type":"AI_INFERRED","evidence":"Day 6 – Client: 'I am not getting enough time to plan meals.' | Day 3 – Coach: 'Slowly we need to adjust the routine around your school schedule also.'"},{"action":"Confirm vegetable restocking and salad habit for Week 2","rationale":"Salad before meals was a coaching goal not followed on Day 1. No follow-up confirmation received.","type":"AI_INFERRED","evidence":"Day 1 – Client: 'Will do it tomorrow.' No confirmation in subsequent days."}]},"day_tracker":[{"day":1,"sleep":5,"water":null,"steps":null,"exercise":"Light (Surya Namaskar + walking)","mood":"Happy","acv":false,"symptoms":["Acidity"]},{"day":2,"sleep":null,"water":"Done","steps":null,"exercise":"Walk (done)","mood":"Neutral","acv":null,"symptoms":["Acidity","Bloating"]},{"day":3,"sleep":5,"water":4,"steps":8000,"exercise":"Walking only","mood":"Hectic","acv":false,"symptoms":[]},{"day":4,"sleep":null,"water":null,"steps":"4500+","exercise":"20 min walk + stretch + breathing","mood":"Really good","acv":true,"symptoms":[]},{"day":5,"sleep":null,"water":null,"steps":null,"exercise":"20 min stretch + running","mood":"Frustrated (weight)","acv":null,"symptoms":["Weight frustration"]},{"day":6,"sleep":null,"water":null,"steps":null,"exercise":null,"mood":"Low energy","acv":null,"symptoms":["Bloating","Low energy"]},{"day":7,"sleep":5.5,"water":null,"steps":6000,"exercise":"Mopping + sweeping","mood":"Very low / Stressed","acv":null,"symptoms":["Extreme fatigue","Stress"]},{"day":8,"sleep":8,"water":3.5,"steps":8000,"exercise":"30 min","mood":"Much better","acv":null,"symptoms":["Bloating (mild)"]}],"client_weight":{"current":83,"unit":"kg","trend":"UNKNOWN","baseline":null,"note":"Only one weight measurement reported (Day 8). Client reported subjective feeling of weight gain on Day 5 but this is self-perception, not a measured value.","type":"CLIENT_REPORTED"},"review":{"status":"PENDING","coach_notes":"","reviewed_by":null,"reviewed_at":null}};

// ─── BOOT ───────────────────────────────────────────────────
function boot() {
  DATA = EMBEDDED_DATA;
  reviewState.status = DATA.review.status;
  renderAll();
  setTimeout(() => {
    document.getElementById('loadingBar').style.display = 'none';
  }, 900);
}

// ─── NAVIGATION ─────────────────────────────────────────────
function navigate(sectionId) {
  // hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  // show target
  const sec = document.getElementById('section-' + sectionId);
  if (sec) sec.classList.add('active');
  const nav = document.getElementById('nav-' + sectionId);
  if (nav) nav.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Render clients section on demand
  if (sectionId === 'clients') {
    setTimeout(renderClientsSection, 0);
  }
}

// ─── RENDER ALL ─────────────────────────────────────────────
function renderAll() {
  renderSummary();
  renderScores();
  renderDimension('nutrition');
  renderDimension('exercise');
  renderDimension('sleep');
  renderDimension('water');
  renderDimension('symptoms');
  renderDimension('stress');
  renderDimension('engagement');
  renderBarriers();
  renderActions();
  renderRisks();
  renderRecommendation();
  renderTracker();
  renderReview();
  updateNavBadge();
}

// ─── HELPERS ────────────────────────────────────────────────
function typeBadge(type, small = false) {
  const map = {
    CONFIRMED: { cls: 'confirmed', icon: '✅', label: 'Confirmed' },
    CLIENT_REPORTED: { cls: 'client-reported', icon: '💬', label: 'Client-Reported' },
    AI_INFERRED: { cls: 'ai-inferred', icon: '🤖', label: 'AI Inferred' },
    MISSING: { cls: 'missing', icon: '❓', label: 'Missing' }
  };
  const t = map[type] || map['MISSING'];
  return `<span class="type-badge ${t.cls}">${t.icon} ${small ? '' : t.label}</span>`;
}

function severityDot(sev) {
  const cls = { CRITICAL: 'sev-critical', HIGH: 'sev-high', MEDIUM: 'sev-medium', LOW: 'sev-low', POSITIVE: 'sev-positive' };
  return `<div class="severity-dot ${cls[sev] || 'sev-low'}"></div>`;
}

function evidenceBlock(evidenceText) {
  const id = 'ev-' + Math.random().toString(36).substr(2, 8);
  return `
    <div class="evidence-toggle" onclick="toggleEvidence('${id}', this)">
      <span class="ev-arrow">▶</span>
      <span>View Evidence</span>
    </div>
    <div class="evidence-panel" id="${id}">
      <div class="evidence-text">${escHtml(evidenceText)}</div>
    </div>`;
}

function toggleEvidence(id, toggleEl) {
  const panel = document.getElementById(id);
  panel.classList.toggle('open');
  toggleEl.classList.toggle('open');
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scoreColor(score) {
  if (score >= 70) return 'var(--green)';
  if (score >= 45) return 'var(--amber)';
  return 'var(--red)';
}

// ─── INLINE EDIT SYSTEM ─────────────────────────────────────
const EDITS_KEY = 'fume_coach_edits';

function getEdits() {
  try { return JSON.parse(localStorage.getItem(EDITS_KEY) || '{}'); } catch { return {}; }
}

function saveEdit(fieldId, original, edited) {
  const edits = getEdits();
  edits[fieldId] = { original, edited, timestamp: new Date().toISOString() };
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

function removeEdit(fieldId) {
  const edits = getEdits();
  delete edits[fieldId];
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

function findingItem(h, fieldId) {
  const edits = getEdits();
  const savedEdit = edits[fieldId];
  const displayText = savedEdit ? savedEdit.edited : h.finding;
  const isEdited = !!savedEdit;

  return `
    <div class="finding-item" id="fi-${fieldId}">
      <div class="finding-header">
        ${severityDot(h.severity)}
        <div class="finding-text" id="ft-${fieldId}">
          ${isEdited
            ? `<span class="diff-removed">${escHtml(savedEdit.original)}</span><br><span class="diff-added">${escHtml(savedEdit.edited)}</span>`
            : escHtml(displayText)
          }
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          ${typeBadge(h.type)}
          ${isEdited ? '<span class="edited-badge">✏️ Edited</span>' : ''}
          <button class="edit-btn" title="Edit finding" onclick="startEdit('${fieldId}', '${escHtml(displayText).replace(/'/g, "\\'")}')">✏️</button>
        </div>
      </div>
      <div class="edit-zone" id="ez-${fieldId}" style="display:none;">
        <textarea class="edit-textarea" id="eta-${fieldId}" rows="3"></textarea>
        <div class="edit-actions">
          <button class="btn-save-edit" onclick="commitEdit('${fieldId}', '${escHtml(h.finding).replace(/'/g, "\\'")}')">✅ Save</button>
          <button class="btn-cancel-edit" onclick="cancelEdit('${fieldId}')">✕ Cancel</button>
          ${isEdited ? `<button class="btn-revert-edit" onclick="revertEdit('${fieldId}')">↩ Revert to Original</button>` : ''}
        </div>
      </div>
      ${evidenceBlock(h.evidence)}
    </div>`;
}

function startEdit(fieldId, currentText) {
  const ez = document.getElementById('ez-' + fieldId);
  const eta = document.getElementById('eta-' + fieldId);
  ez.style.display = 'block';
  eta.value = currentText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  eta.focus();
}

function cancelEdit(fieldId) {
  document.getElementById('ez-' + fieldId).style.display = 'none';
}

function commitEdit(fieldId, original) {
  const eta = document.getElementById('eta-' + fieldId);
  const newText = eta.value.trim();
  if (!newText || newText === original) { cancelEdit(fieldId); return; }
  const cleanOriginal = original.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  saveEdit(fieldId, cleanOriginal, newText);
  const ft = document.getElementById('ft-' + fieldId);
  ft.innerHTML = `<span class="diff-removed">${escHtml(cleanOriginal)}</span><br><span class="diff-added">${escHtml(newText)}</span>`;
  document.getElementById('ez-' + fieldId).style.display = 'none';
  showToast('Finding updated. View all edits in Coach Review.');
  // Refresh edits log if review panel is open
  const logsEl = document.getElementById('editsLogContent');
  if (logsEl) renderEditsLog();
}

function revertEdit(fieldId) {
  removeEdit(fieldId);
  showToast('Edit reverted to original.');
  // Re-render the whole section — simplest approach for static site
  renderAll();
}

function renderEditsLog() {
  const el = document.getElementById('editsLogContent');
  if (!el) return;
  const edits = getEdits();
  const keys = Object.keys(edits);
  if (keys.length === 0) {
    el.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:16px 0;">No field-level corrections yet. Open any dimension section and click the ✏️ icon on a finding to correct it.</div>`;
    return;
  }
  el.innerHTML = keys.map(fid => {
    const e = edits[fid];
    const ts = new Date(e.timestamp).toLocaleString();
    return `
      <div class="edit-log-item">
        <div class="edit-log-meta">✏️ Edited · ${ts}</div>
        <div class="diff-removed">${escHtml(e.original)}</div>
        <div class="diff-added">${escHtml(e.edited)}</div>
        <button class="btn-revert-edit" onclick="revertEdit('${fid}')">↩ Revert</button>
      </div>`;
  }).join('');
}

function scoreRing(score, color, label) {
  const circumference = 251.2;
  const offset = circumference - (score / 100) * circumference;
  return `
    <div class="score-ring">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle class="score-ring-bg" cx="45" cy="45" r="40" fill="none" stroke-width="6"/>
        <circle class="score-ring-fill" cx="45" cy="45" r="40" fill="none"
          stroke="${color}" stroke-width="6"
          style="stroke-dashoffset:${offset}"
          data-offset="${offset}"/>
      </svg>
      <div class="score-ring-text" style="color:${color}">${score}</div>
    </div>
    <div class="score-label-text" style="color:${color}">${label}</div>`;
}

// ─── SUMMARY ────────────────────────────────────────────────
function renderSummary() {
  document.getElementById('summaryText').textContent = DATA.weekly_summary.text;
}

// ─── SCORES ─────────────────────────────────────────────────
function renderScores() {
  const dims = DATA.dimensions;
  const keys = ['nutrition', 'exercise', 'sleep', 'water', 'symptoms', 'stress_mood', 'engagement'];
  const grid = document.getElementById('scoresGrid');
  grid.innerHTML = keys.map(k => {
    const d = dims[k];
    if (!d) return '';
    const color = scoreColor(d.score);
    return `
      <div class="card score-card" onclick="navigate('${k === 'stress_mood' ? 'stress' : k}')">
        <div class="score-name">${d.label}</div>
        ${scoreRing(d.score, color, d.score_label)}
      </div>`;
  }).join('');

  // Animate rings after render
  setTimeout(animateRings, 100);
}

function animateRings() {
  document.querySelectorAll('.score-ring-fill').forEach(ring => {
    const target = ring.getAttribute('data-offset');
    ring.style.strokeDashoffset = target;
  });
}

// ─── GENERIC DIMENSION RENDERER ─────────────────────────────
function renderDimension(dimKey) {
  const keyMap = {
    nutrition: 'nutrition', exercise: 'exercise', sleep: 'sleep',
    water: 'water', symptoms: 'symptoms', stress: 'stress_mood',
    engagement: 'engagement'
  };
  const d = DATA.dimensions[keyMap[dimKey]];
  if (!d) return;

  const containerId = dimKey + 'Content';
  const el = document.getElementById(containerId);
  const color = scoreColor(d.score);

  let html = `
    <!-- SCORE SUMMARY CARD -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        <div style="flex-shrink:0;">
          ${scoreRing(d.score, color, d.score_label)}
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">${d.label}</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${escHtml(d.summary)}</div>
          ${d.confidence ? `
            <div style="margin-top:12px;">
              <div class="confidence-chip ${d.confidence.score >= 80 ? 'confidence-high' : d.confidence.score >= 60 ? 'confidence-moderate' : 'confidence-low'}">
                ${d.confidence.score >= 80 ? '🟢' : d.confidence.score >= 60 ? '🟡' : '🔴'} ${d.confidence.label}
              </div>
              <div class="confidence-note" style="margin-top:4px;">
                Based on ${d.confidence.reported_days} of ${d.confidence.total_days} days reported. ${d.confidence.std_dev ? `(Std Dev: ±${d.confidence.std_dev})` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>`;

  // Highlights
  if (d.highlights && d.highlights.length) {
    html += `<div class="section-header" style="margin-bottom:12px;"><h2 style="font-size:15px;">Key Findings</h2></div>`;
    html += d.highlights.map((h, i) => {
      const fieldId = `${dimKey}-h${i}`;
      return findingItem(h, fieldId);
    }).join('');
  }

  // Day-specific logs
  if (dimKey === 'sleep' && d.sleep_log) {
    html += renderSleepLog(d);
  }
  if (dimKey === 'water' && d.water_log) {
    html += renderWaterLog(d);
  }
  if (dimKey === 'exercise' && d.steps_log) {
    html += renderStepsLog(d);
  }
  if (dimKey === 'nutrition' && d.days_data) {
    html += renderNutritionDays(d);
  }

  el.innerHTML = html;
  setTimeout(animateRings, 100);
}

function renderSleepLog(d) {
  const days = Object.entries(d.sleep_log);
  return `
    <div class="section-header" style="margin-top:24px;margin-bottom:12px;"><h2 style="font-size:15px;">Sleep Log</h2></div>
    <div class="card">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
        ${days.map(([day, v]) => {
          const num = parseInt(day.replace('day',''));
          const cls = v.hours === null ? 'sleep-bad' : (v.hours >= 7 ? 'sleep-good' : (v.hours >= 6 ? 'sleep-warn' : 'sleep-bad'));
          const label = v.hours === null ? '—' : v.hours + 'h';
          const height = v.hours === null ? 20 : Math.max(20, (v.hours / 10) * 100);
          return `
            <div style="flex:1;min-width:60px;text-align:center;">
              <div style="font-size:11px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${label}</div>
              <div style="height:${height}px;background:${v.hours===null?'var(--bg-elevated)':v.hours>=7?'var(--green-dim)':v.hours>=6?'var(--amber-dim)':'var(--red-dim)'};border:1px solid ${v.hours===null?'var(--border-subtle)':v.hours>=7?'rgba(16,185,129,0.3)':v.hours>=6?'rgba(245,158,11,0.3)':'rgba(239,68,68,0.3)'};border-radius:6px 6px 0 0;display:flex;align-items:flex-end;justify-content:center;transition:height 0.8s ease;"></div>
              <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-top:none;padding:4px;border-radius:0 0 6px 6px;font-size:10px;color:var(--text-muted);">D${num}</div>
            </div>`;
        }).join('')}
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--text-muted);">
        Weekly avg (known days only): <strong style="color:var(--text-primary);">${d.weekly_avg_known_days}h</strong> · ${d.weekly_avg_note}
      </div>
    </div>`;
}

function renderWaterLog(d) {
  const days = Object.entries(d.water_log);
  return `
    <div class="section-header" style="margin-top:24px;margin-bottom:12px;"><h2 style="font-size:15px;">Hydration Log</h2></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${days.map(([day, v]) => {
        const num = parseInt(day.replace('day',''));
        const val = v.litres !== null ? v.litres + 'L' : (v.confirmed ? 'Done' : '—');
        const color = v.litres === null ? (v.confirmed ? 'var(--blue)' : 'var(--text-muted)') : (v.litres >= 3 ? 'var(--green)' : 'var(--amber)');
        return `
          <div class="card" style="text-align:center;padding:14px 10px;">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Day ${num}</div>
            <div style="font-size:20px;font-weight:800;color:${color};">${val}</div>
            ${typeBadge(v.type)}
          </div>`;
      }).join('')}
    </div>`;
}

function renderStepsLog(d) {
  const days = Object.entries(d.steps_log);
  return `
    <div class="section-header" style="margin-top:24px;margin-bottom:12px;"><h2 style="font-size:15px;">Steps Log</h2></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${days.map(([day, v]) => {
        const num = parseInt(day.replace('day',''));
        const color = v.value === null ? 'var(--text-muted)' : (v.value >= 8000 ? 'var(--green)' : v.value >= 5000 ? 'var(--amber)' : 'var(--red)');
        return `
          <div class="card" style="text-align:center;padding:14px 10px;">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Day ${num}</div>
            <div style="font-size:18px;font-weight:800;color:${color};">${v.label}</div>
            ${typeBadge(v.type)}
          </div>`;
      }).join('')}
    </div>`;
}

function renderNutritionDays(d) {
  const days = Object.entries(d.days_data);
  return `
    <div class="section-header" style="margin-top:24px;margin-bottom:12px;"><h2 style="font-size:15px;">Meal Log</h2></div>
    <div class="card" style="padding:0;overflow:hidden;">
      <table class="tracker-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
          </tr>
        </thead>
        <tbody>
          ${days.map(([day, v]) => {
            const num = parseInt(day.replace('day',''));
            const cell = (val) => val === 'MISSING'
              ? `<span class="cell-missing">Not reported</span>`
              : `<span class="cell-value">${escHtml(val)}</span>`;
            return `
              <tr>
                <td><span class="tracker-day-label">Day ${num}</span></td>
                <td>${cell(v.breakfast)}</td>
                <td>${cell(v.lunch)}</td>
                <td>${cell(v.dinner)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── BARRIERS ────────────────────────────────────────────────
function renderBarriers() {
  const el = document.getElementById('barriersContent');
  const ranks = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
  el.innerHTML = DATA.key_barriers.map((b, i) => `
    <div class="barrier-item">
      <div class="barrier-rank ${ranks[b.severity]}">${i + 1}</div>
      <div class="barrier-body">
        <div class="barrier-title">${escHtml(b.barrier)}</div>
        <div style="margin-bottom:8px;">${typeBadge(b.type)} <span style="font-size:10px;margin-left:6px;padding:2px 8px;border-radius:4px;background:rgba(239,68,68,0.1);color:var(--red);font-weight:600;">${b.severity}</span></div>
        <div class="barrier-impact">${escHtml(b.impact)}</div>
        ${evidenceBlock(b.evidence)}
      </div>
    </div>`).join('');
}

// ─── ACTIONS ────────────────────────────────────────────────
function renderActions() {
  const el = document.getElementById('actionsContent');
  const ownerMap = { CLIENT: 'client', COACH: 'coach', 'COACH + CLIENT': 'both' };
  const statusMap = { OPEN: 'open', IN_PROGRESS: 'in-progress', UNKNOWN: 'unknown' };
  el.innerHTML = DATA.pending_actions.map(a => `
    <div class="action-item">
      <div class="action-id">${a.id.replace('PA', '')}</div>
      <div class="action-body">
        <div class="action-text">${escHtml(a.action)}</div>
        <div class="action-meta">
          <span class="owner-badge ${ownerMap[a.owner] || 'client'}">${a.owner}</span>
          <span class="status-badge ${statusMap[a.status] || 'open'}">${a.status.replace('_', ' ')}</span>
          <span style="font-size:11px;color:var(--text-muted);">Due: ${escHtml(a.due)}</span>
        </div>
        ${evidenceBlock(a.evidence)}
      </div>
    </div>`).join('');
}

// ─── RISKS ───────────────────────────────────────────────────
function renderRisks() {
  const el = document.getElementById('risksContent');
  const clsMap = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'medium' };
  const criticalCount = DATA.risk_flags.filter(r => r.severity === 'CRITICAL').length;
  const highCount = DATA.risk_flags.filter(r => r.severity === 'HIGH').length;

  let html = `
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div class="card" style="padding:14px 20px;display:flex;align-items:center;gap:10px;border-color:rgba(255,59,59,0.3);">
        <div style="font-size:24px;font-weight:800;color:#ff3b3b;">${criticalCount}</div>
        <div style="font-size:12px;color:var(--text-muted);">Critical<br>Flags</div>
      </div>
      <div class="card" style="padding:14px 20px;display:flex;align-items:center;gap:10px;border-color:rgba(239,68,68,0.25);">
        <div style="font-size:24px;font-weight:800;color:var(--red);">${highCount}</div>
        <div style="font-size:12px;color:var(--text-muted);">High Priority<br>Flags</div>
      </div>
    </div>`;

  html += DATA.risk_flags.map(r => `
    <div class="risk-card ${clsMap[r.severity]}">
      <div class="risk-header">
        ${severityDot(r.severity)}
        <span class="risk-severity-label">${r.severity}</span>
        ${typeBadge(r.type)}
        <span style="font-size:10px;color:var(--text-muted);margin-left:auto;">${r.category.replace(/_/g,' ')}</span>
      </div>
      <div class="risk-flag-text">${escHtml(r.flag)}</div>
      <div class="risk-action"><strong>→ Recommended action:</strong> ${escHtml(r.action_required)}</div>
      ${evidenceBlock(r.evidence)}
    </div>`).join('');

  el.innerHTML = html;
  document.getElementById('riskCount').textContent = DATA.risk_flags.length;
}

// ─── RECOMMENDATION ──────────────────────────────────────────
function renderRecommendation() {
  const el = document.getElementById('recommendationContent');
  const rec = DATA.recommended_next_action;

  let html = `
    <div class="rec-action-card">
      <div class="rec-action-label">⭐ Primary Recommendation</div>
      <div class="rec-action-text">${escHtml(rec.primary.action)}</div>
      <div style="margin-bottom:12px;">${typeBadge(rec.primary.type)}</div>
      <div class="rec-action-rationale">${escHtml(rec.primary.rationale)}</div>
      ${evidenceBlock(rec.primary.evidence)}
    </div>

    <div class="section-header" style="margin-top:24px;margin-bottom:12px;">
      <h2 style="font-size:15px;">Secondary Recommendations</h2>
    </div>
    <div class="secondary-actions">
      ${rec.secondary.map((s, i) => `
        <div class="secondary-action-item">
          <div class="secondary-action-num">${i + 2}.</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">${escHtml(s.action)}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">${escHtml(s.rationale)}</div>
            ${typeBadge(s.type)}
            ${evidenceBlock(s.evidence)}
          </div>
        </div>`).join('')}
    </div>`;

  el.innerHTML = html;
}

// ─── DAY TRACKER ─────────────────────────────────────────────
function renderTracker() {
  const el = document.getElementById('trackerContent');
  const rows = DATA.day_tracker.map(d => {
    const sleepCls = d.sleep === null ? '' : (d.sleep >= 7 ? 'sleep-good' : d.sleep >= 6 ? 'sleep-warn' : 'sleep-bad');
    const sleepLabel = d.sleep === null ? '<span class="cell-missing">—</span>' : `<span class="sleep-chip ${sleepCls}">${d.sleep}h</span>`;
    const waterLabel = d.water === null ? '<span class="cell-missing">—</span>' : (d.water === 'Done' ? '<span class="cell-good">Done</span>' : `<span class="cell-value">${d.water}L</span>`);
    const stepsLabel = d.steps === null ? '<span class="cell-missing">—</span>' : `<span class="cell-value">${d.steps.toLocaleString()}</span>`;
    const symptoms = d.symptoms.length === 0
      ? '<span class="cell-missing">None</span>'
      : d.symptoms.map(s => `<span class="symptom-tag">${escHtml(s)}</span>`).join('');
    const acv = d.acv === true ? '✅' : d.acv === false ? '❌' : '<span class="cell-missing">—</span>';
    const moodColor = d.mood?.toLowerCase().includes('low') || d.mood?.toLowerCase().includes('stress') || d.mood?.toLowerCase().includes('frustrated')
      ? 'var(--red)' : d.mood?.toLowerCase().includes('good') || d.mood?.toLowerCase().includes('happy') || d.mood?.toLowerCase().includes('better')
        ? 'var(--green)' : 'var(--text-secondary)';

    return `
      <tr>
        <td><span class="tracker-day-label">Day ${d.day}</span></td>
        <td class="${d.sleep === null ? 'missing-data' : ''}">${sleepLabel}</td>
        <td class="${d.water === null ? 'missing-data' : ''}">${waterLabel}</td>
        <td class="${d.steps === null ? 'missing-data' : ''}">${stepsLabel}</td>
        <td class="${!d.exercise ? 'missing-data' : ''}"><span style="font-size:12px;color:var(--text-secondary)">${escHtml(d.exercise || '—')}</span></td>
        <td class="${!d.mood ? 'missing-data' : ''}"><span style="font-size:12px;color:${moodColor}">${escHtml(d.mood || '—')}</span></td>
        <td class="${d.acv === null ? 'missing-data' : ''}">${acv}</td>
        <td class="${d.symptoms.length === 0 ? 'missing-data' : ''}">${symptoms}</td>
      </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="card" style="padding:0;overflow:hidden;overflow-x:auto;">
      <table class="tracker-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Sleep</th>
            <th>Water</th>
            <th>Steps</th>
            <th>Exercise</th>
            <th>Mood</th>
            <th>ACV</th>
            <th>Symptoms</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="margin-top:12px;font-size:11px;color:var(--text-muted);padding:0 4px;">
      ❓ = Data not reported in conversation. All values are <span class="type-badge client-reported" style="font-size:9px;">💬 Client-Reported</span> unless otherwise noted.
    </div>`;
}

// ─── REVIEW ──────────────────────────────────────────────────
function renderReview() {
  const el = document.getElementById('reviewContent');

  el.innerHTML = `
    <div class="review-panel">
      <div class="review-title">👁️ Coach Review Panel</div>
      <div class="review-subtitle">Review this AI-generated intelligence report and confirm accuracy before acting on it.</div>

      <div class="review-status-bar ${reviewState.status.toLowerCase()}" id="reviewStatusBar">
        <div class="review-status-icon" id="reviewStatusIcon">⏳</div>
        <div class="review-status-text">
          <strong id="reviewStatusTitle">Awaiting Coach Review</strong>
          <span id="reviewStatusSub">This report has not yet been reviewed or approved.</span>
        </div>
      </div>

      <div class="review-actions-row">
        <button class="btn btn-approve" id="btnApprove" onclick="setReviewStatus('APPROVED')">
          ✅ Approve
        </button>
        <button class="btn btn-edit" id="btnEdit" onclick="toggleEditMode()">
          ✏️ Edit Notes
        </button>
        <button class="btn btn-reject" id="btnReject" onclick="setReviewStatus('REJECTED')">
          ❌ Reject
        </button>
      </div>

      <div id="editModePanel" style="display:none;">
        <div class="review-notes-label">Coach Notes (corrections, additions, or concerns)</div>
        <textarea class="review-notes-area" id="coachNotesArea" placeholder="Add your notes here — e.g., 'The sleep data for Day 4 was actually 6 hours per client's verbal update during the call. Stress on Day 7 needs immediate follow-up.'">${reviewState.notes}</textarea>
        <button class="btn btn-submit-review" onclick="saveNotes()">💾 Save Notes</button>
      </div>

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-subtle);">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">About This Report</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">
          <div style="padding:10px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;">
            <div style="color:var(--text-muted);margin-bottom:4px;">Source</div>
            <div style="color:var(--text-primary);font-weight:500;">${DATA.metadata.source_file}</div>
          </div>
          <div style="padding:10px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;">
            <div style="color:var(--text-muted);margin-bottom:4px;">Analysis Model</div>
            <div style="color:var(--text-primary);font-weight:500;">${DATA.metadata.model_version}</div>
          </div>
          <div style="padding:10px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;">
            <div style="color:var(--text-muted);margin-bottom:4px;">Week</div>
            <div style="color:var(--text-primary);font-weight:500;">${DATA.metadata.week_label}</div>
          </div>
          <div style="padding:10px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;">
            <div style="color:var(--text-muted);margin-bottom:4px;">Generated</div>
            <div style="color:var(--text-primary);font-weight:500;">${new Date(DATA.metadata.generated_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px;padding:14px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;">
        <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:6px;">⚠️ AI Disclaimer</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.7;">
          This report is generated by AI analysis of a text conversation. It may contain errors, misinterpretations, or omissions.
          All findings labeled <strong>AI Inferred</strong> are model-derived inferences — not clinical diagnoses.
          Always use professional judgment before acting on any recommendation. Approve this report only after verifying key findings against the original conversation.
        </div>
      </div>

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-subtle);">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">✏️ Coach Corrections</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Field-level edits made by the coach. Click the ✏️ icon on any finding to correct AI errors.</div>
        <div id="editsLogContent"></div>
      </div>

      <!-- FOLLOW-UP SUGGESTIONS -->
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-subtle);">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">💬 Suggested Follow-up Messages</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">AI-drafted messages the coach can send to the client. Derived from this week's risk flags and findings.</div>
        <div id="followUpMessages"></div>
      </div>

      <!-- EXPORT REPORT -->
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-subtle);">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:10px;">📤 Export Report</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-export" onclick="exportMarkdown()">⬇️ Download as Markdown</button>
          <button class="btn-export" onclick="copyJson()">📋 Copy JSON</button>
        </div>
      </div>
    </div>`;

  updateReviewPanel();
  renderEditsLog();
  renderFollowUps();
}

function setReviewStatus(status) {
  reviewState.status = status;
  reviewState.reviewedAt = new Date().toISOString();
  updateReviewPanel();
  updateNavBadge();
  const msgs = { APPROVED: '✅ Report approved successfully', REJECTED: '❌ Report rejected' };
  showToast(msgs[status], status === 'APPROVED' ? 'success' : 'error');
}

function toggleEditMode() {
  const panel = document.getElementById('editModePanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function saveNotes() {
  reviewState.notes = document.getElementById('coachNotesArea').value;
  showToast('📝 Notes saved', 'info');
  document.getElementById('editModePanel').style.display = 'none';
}

function updateReviewPanel() {
  const bar = document.getElementById('reviewStatusBar');
  const icon = document.getElementById('reviewStatusIcon');
  const title = document.getElementById('reviewStatusTitle');
  const sub = document.getElementById('reviewStatusSub');
  if (!bar) return;

  bar.className = `review-status-bar ${reviewState.status.toLowerCase()}`;
  if (reviewState.status === 'APPROVED') {
    icon.textContent = '✅';
    title.textContent = 'Report Approved';
    sub.textContent = `Approved at ${new Date(reviewState.reviewedAt).toLocaleString()}`;
  } else if (reviewState.status === 'REJECTED') {
    icon.textContent = '❌';
    title.textContent = 'Report Rejected';
    sub.textContent = `Rejected at ${new Date(reviewState.reviewedAt).toLocaleString()}. Please review and regenerate.`;
  } else {
    icon.textContent = '⏳';
    title.textContent = 'Awaiting Coach Review';
    sub.textContent = 'This report has not yet been reviewed or approved.';
  }
}

function updateNavBadge() {
  const badge = document.getElementById('navReviewBadge');
  const text = document.getElementById('navReviewText');
  if (!badge) return;
  badge.className = `nav-badge ${reviewState.status.toLowerCase()}`;
  const labels = { PENDING: 'Awaiting Review', APPROVED: 'Approved', REJECTED: 'Rejected' };
  text.textContent = labels[reviewState.status] || 'Awaiting Review';
}

// ─── FOLLOW-UP SUGGESTIONS ───────────────────────────────────
function generateFollowUps() {
  const msgs = [];

  // Generate from risk flags
  if (DATA.risk_flags && DATA.risk_flags.length) {
    DATA.risk_flags.forEach(r => {
      if (r.severity === 'CRITICAL') {
        msgs.push({
          tone: 'Concerned',
          toneCls: 'tone-concerned',
          context: r.flag.substring(0, 60) + '…',
          text: `Hi, I wanted to check in with you personally after reviewing your data from this week. I noticed something that concerned me — ${r.flag.toLowerCase()}. How are you feeling right now? I'd love to schedule a quick call today if possible.`
        });
      } else if (r.severity === 'HIGH') {
        msgs.push({
          tone: 'Action-oriented',
          toneCls: 'tone-action',
          context: r.flag.substring(0, 60) + '…',
          text: `Quick check-in on this week's progress! I noticed ${r.flag.toLowerCase()}. ${r.action_required} Let's work on this together in our next session.`
        });
      }
    });
  }

  // Generate from primary recommendation
  if (DATA.recommended_next_action?.primary) {
    const rec = DATA.recommended_next_action.primary;
    msgs.push({
      tone: 'Motivational',
      toneCls: 'tone-motivational',
      context: 'Primary recommendation',
      text: `Great work this week! You showed real commitment even through a tough schedule. For next week, I'd like us to focus on one thing: ${rec.action.toLowerCase()}. Small steps, big results! 💪`
    });
  }

  // Generate from pending actions
  const openActions = (DATA.pending_actions || []).filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS');
  if (openActions.length) {
    msgs.push({
      tone: 'Check-in',
      toneCls: 'tone-checkin',
      context: 'Pending actions follow-up',
      text: `Just a friendly nudge on a couple of things we discussed: ${openActions.slice(0, 2).map(a => a.action.toLowerCase()).join('; and ')}. How is that going? Any roadblocks I can help with?`
    });
  }

  return msgs.slice(0, 4); // max 4 suggestions
}

function renderFollowUps() {
  const el = document.getElementById('followUpMessages');
  if (!el) return;
  const msgs = generateFollowUps();

  if (!msgs.length) {
    el.innerHTML = `<div style="color:var(--text-muted);font-size:13px;">No suggestions generated — approve the report first to unlock follow-up drafts.</div>`;
    return;
  }

  el.innerHTML = msgs.map((m, i) => `
    <div class="followup-card" id="fup-${i}">
      <div class="followup-header">
        <span class="tone-badge ${m.toneCls}">${m.tone}</span>
        <span class="followup-context">${escHtml(m.context)}</span>
        <button class="btn-copy-msg" onclick="copyMsg(${i})" title="Copy to clipboard">📋 Copy</button>
      </div>
      <div class="followup-text" id="fup-text-${i}">${escHtml(m.text)}</div>
    </div>
  `).join('');
}

function copyMsg(index) {
  const el = document.getElementById('fup-text-' + index);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    showToast('✅ Message copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for file:// protocol
    const ta = document.createElement('textarea');
    ta.value = el.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ Message copied!', 'success');
  });
}

// ─── EXPORT REPORT ───────────────────────────────────────────
function exportMarkdown() {
  const d = DATA;
  const dims = d.dimensions || {};
  const dimKeys = ['nutrition', 'exercise', 'sleep', 'water', 'symptoms', 'stress_mood', 'engagement'];

  let md = `# FUME Client Intelligence Report
**Client:** ${d.metadata.client_display_name}
**Week:** ${d.metadata.week_label}
**Generated:** ${new Date(d.metadata.generated_at).toLocaleDateString()}
**Review Status:** ${reviewState.status}

---

## Weekly Summary
${d.weekly_summary.text}

---

## Dimension Scores
| Dimension | Score | Label |
|-----------|-------|-------|
`;

  dimKeys.forEach(k => {
    const dim = dims[k];
    if (dim) md += `| ${dim.label} | ${dim.score}/100 | ${dim.score_label} |\n`;
  });

  md += `\n---\n\n## Key Findings\n`;
  dimKeys.forEach(k => {
    const dim = dims[k];
    if (dim?.highlights?.length) {
      md += `\n### ${dim.label}\n`;
      dim.highlights.forEach(h => {
        md += `- **[${h.type}]** ${h.finding}\n  > *Evidence:* ${h.evidence}\n`;
      });
    }
  });

  md += `\n---\n\n## Risk Flags\n`;
  (d.risk_flags || []).forEach(r => {
    md += `- 🚩 **[${r.severity}]** ${r.flag}\n  - Action: ${r.action_required}\n  - Evidence: ${r.evidence}\n\n`;
  });

  md += `\n---\n\n## Recommended Next Action\n`;
  if (d.recommended_next_action?.primary) {
    const p = d.recommended_next_action.primary;
    md += `**Primary:** ${p.action}\n\n*Rationale:* ${p.rationale}\n\n`;
    md += `**Secondary Actions:**\n`;
    (d.recommended_next_action.secondary || []).forEach(s => {
      md += `- ${s.action}\n`;
    });
  }

  md += `\n---\n\n## Pending Actions\n`;
  (d.pending_actions || []).forEach(a => {
    md += `- [${a.status}] ${a.action} *(Owner: ${a.owner})*\n`;
  });

  if (reviewState.notes) {
    md += `\n---\n\n## Coach Notes\n${reviewState.notes}\n`;
  }

  md += `\n---\n*Generated by FUME Client Intelligence Platform*\n`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fume-report-${d.metadata.client_id}-${d.metadata.week_label.replace(/\s/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Report downloaded as Markdown!', 'success');
}

function copyJson() {
  const jsonStr = JSON.stringify(DATA, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    showToast('📋 JSON copied to clipboard!', 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = jsonStr;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📋 JSON copied!', 'success');
  });
}

// ─── TOAST ───────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── LLM PANEL ───────────────────────────────────────────────
function toggleLlmPanel() {
  const body = document.getElementById('llmBody');
  const btn = document.getElementById('llmToggleBtn');
  const open = body.style.display === 'none';
  body.style.display = open ? 'block' : 'none';
  btn.textContent = open ? '▲ Collapse' : '▼ Expand';
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('llmTextarea').value = e.target.result;
    updateCharCount();
  };
  reader.readAsText(file);
}

function handleFileDrop(event) {
  event.preventDefault();
  document.getElementById('llmDropzone').classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('llmTextarea').value = e.target.result;
    updateCharCount();
  };
  reader.readAsText(file);
}

function updateCharCount() {
  const len = document.getElementById('llmTextarea').value.length;
  document.getElementById('llmCharCount').textContent = `${len.toLocaleString()} characters`;
}

// Wire up textarea character counter
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('llmTextarea');
  if (ta) ta.addEventListener('input', updateCharCount);
});

async function runAnalysis() {
  const text = document.getElementById('llmTextarea').value.trim();
  const errEl = document.getElementById('llmError');
  errEl.style.display = 'none';

  if (text.length < 100) {
    errEl.textContent = '⚠️ Please paste a conversation with at least 100 characters.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('btnAnalyse');
  const label = document.getElementById('analyseLabel');
  btn.disabled = true;
  label.innerHTML = '<span class="llm-spinner"></span> Analysing with Gemini…';

  try {
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_text: text })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const newData = await res.json();
    DATA = newData;
    isLiveData = true;
    reviewState = { status: 'PENDING', notes: '', reviewedAt: null };

    // Clear any old coach edits since it's a new conversation
    localStorage.removeItem('fume_coach_edits');

    renderAll();
    updateLiveBadge();
    showToast('✅ Live analysis complete! Dashboard updated.', 'success');

    // Collapse the panel
    document.getElementById('llmBody').style.display = 'none';
    document.getElementById('llmToggleBtn').textContent = '▼ Expand';

    // Navigate to summary
    navigate('summary');

  } catch (err) {
    errEl.textContent = `❌ Analysis failed: ${err.message}`;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    label.innerHTML = '🚀 Analyse with Gemini';
  }
}

function resetToEmbedded() {
  DATA = EMBEDDED_DATA;
  isLiveData = false;
  reviewState = { status: DATA.review?.status || 'PENDING', notes: '', reviewedAt: null };
  localStorage.removeItem('fume_coach_edits');
  renderAll();
  updateLiveBadge();
  showToast('Demo data restored.', 'info');
}

function updateLiveBadge() {
  const badge = document.getElementById('liveBadge');
  if (!badge) return;
  badge.style.display = isLiveData ? 'inline-flex' : 'none';
  badge.textContent = isLiveData ? '⚡ Live Analysis' : '';
}

// ─── MULTI-CLIENT SYSTEM ─────────────────────────────────────

// Pre-seeded demo clients
const DEMO_CLIENTS = [
  {
    id: 'CLIENT_001',
    name: 'Priya M.',
    role: 'School Teacher',
    week: 'Week 1',
    days: 'Day 1–8',
    avatar: '👩‍🏫',
    risk_count: 4,
    engagement: 78,
    sleep_avg: 5.9,
    steps_avg: 7333,
    top_risk: 'CRITICAL',
    top_risk_label: 'Fell asleep in meeting',
    scores: { nutrition: 55, exercise: 62, sleep: 40, water: 55, engagement: 78 },
    sleep_log: [5, null, 5, null, null, null, 5.5, 8],
    steps_log: [null, null, 8000, 4500, null, null, 6000, 8000],
    dataKey: 'EMBEDDED'
  },
  {
    id: 'CLIENT_002',
    name: 'Ananya R.',
    role: 'Software Engineer',
    week: 'Week 2',
    days: 'Day 9–16',
    avatar: '👩‍💻',
    risk_count: 2,
    engagement: 85,
    sleep_avg: 6.8,
    steps_avg: 9200,
    top_risk: 'HIGH',
    top_risk_label: 'Skipping breakfast 3/7 days',
    scores: { nutrition: 48, exercise: 75, sleep: 65, water: 70, engagement: 85 },
    sleep_log: [7, 6.5, 7, null, 6, 7.5, 8, 6],
    steps_log: [9000, 10000, null, 8500, 9500, null, 10200, 8000],
    dataKey: 'DEMO_2'
  },
  {
    id: 'CLIENT_003',
    name: 'Kavya S.',
    role: 'Home-maker',
    week: 'Week 1',
    days: 'Day 1–7',
    avatar: '👩‍🍳',
    risk_count: 1,
    engagement: 92,
    sleep_avg: 7.5,
    steps_avg: 6100,
    top_risk: 'MEDIUM',
    top_risk_label: 'Low water intake',
    scores: { nutrition: 72, exercise: 58, sleep: 78, water: 42, engagement: 92 },
    sleep_log: [7, 8, 7.5, 7, 8, 7, null],
    steps_log: [5500, 6000, null, 7000, 6500, null, 5800],
    dataKey: 'DEMO_3'
  }
];

let activeClientId = 'CLIENT_001';
let sleepChartInst = null;
let stepsChartInst = null;

function getClient(id) {
  return DEMO_CLIENTS.find(c => c.id === id) || DEMO_CLIENTS[0];
}

function renderClientsSection() {
  const grid = document.getElementById('clientsGrid');
  if (!grid) return;

  grid.innerHTML = DEMO_CLIENTS.map(c => {
    const isActive = c.id === activeClientId;
    const riskCls = c.top_risk === 'CRITICAL' ? 'sev-critical' : c.top_risk === 'HIGH' ? 'sev-high' : 'sev-medium';
    const sleepPct = Math.min((c.sleep_avg / 9) * 100, 100);
    const engPct = c.engagement;

    return `
      <div class="client-card ${isActive ? 'active-client' : ''}" onclick="switchClient('${c.id}')">
        <div class="client-card-header">
          <div class="client-avatar">${c.avatar}</div>
          <div class="client-info">
            <div class="client-name">${c.name} ${isActive ? '<span class="active-tag">● Active</span>' : ''}</div>
            <div class="client-role">${c.role} · ${c.week}</div>
          </div>
          <div class="severity-dot ${riskCls}" style="margin-left:auto;flex-shrink:0;width:10px;height:10px;"></div>
        </div>

        <div class="client-metrics-row">
          <div class="client-metric">
            <div class="client-metric-val">${c.sleep_avg}h</div>
            <div class="client-metric-lbl">Avg Sleep</div>
          </div>
          <div class="client-metric">
            <div class="client-metric-val">${(c.steps_avg / 1000).toFixed(1)}k</div>
            <div class="client-metric-lbl">Avg Steps</div>
          </div>
          <div class="client-metric">
            <div class="client-metric-val">${c.engagement}</div>
            <div class="client-metric-lbl">Engagement</div>
          </div>
          <div class="client-metric">
            <div class="client-metric-val" style="color:var(${c.top_risk === 'CRITICAL' ? '--red' : c.top_risk === 'HIGH' ? '--amber' : '--text-secondary'})">${c.risk_count}</div>
            <div class="client-metric-lbl">Risk Flags</div>
          </div>
        </div>

        <div class="client-risk-label">
          <span class="severity-dot ${riskCls}" style="width:7px;height:7px;flex-shrink:0;"></span>
          ${escHtml(c.top_risk_label)}
        </div>

        <div class="client-score-bars">
          <div class="score-bar-row">
            <span>Sleep</span>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${sleepPct}%;background:${sleepPct < 55 ? 'var(--red)' : sleepPct < 75 ? 'var(--amber)' : 'var(--green)'}"></div></div>
          </div>
          <div class="score-bar-row">
            <span>Engage</span>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${engPct}%;background:var(--teal)"></div></div>
          </div>
        </div>

        <button class="btn-load-client" onclick="event.stopPropagation();switchClient('${c.id}')">
          ${isActive ? '✓ Currently Viewing' : '→ Load Report'}
        </button>
      </div>`;
  }).join('');

  renderTrendCharts();
}

function switchClient(clientId) {
  activeClientId = clientId;
  const client = getClient(clientId);

  // For demo: only CLIENT_001 has real data (EMBEDDED_DATA)
  // Others show a placeholder toast
  if (client.dataKey === 'EMBEDDED') {
    DATA = EMBEDDED_DATA;
    isLiveData = false;
    reviewState = { status: DATA.review?.status || 'PENDING', notes: '', reviewedAt: null };
    renderAll();
    updateLiveBadge();
  } else {
    showToast(`📋 ${client.name}'s data would load here in production (connected to backend).`, 'info');
  }

  // Update nav label
  const navLabel = document.getElementById('navClientLabel');
  if (navLabel) navLabel.textContent = `${client.week} · ${client.days} · ${client.name}`;

  renderClientsSection();
  showToast(`Switched to ${client.name}`, 'success');
}

function renderTrendCharts() {
  const client = getClient(activeClientId);
  const days = client.sleep_log.map((_, i) => `Day ${i + 1}`);

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e2433', titleColor: '#e2e8f0', bodyColor: '#94a3b8', borderColor: '#2a3347', borderWidth: 1 }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } }
    }
  };

  // Destroy old chart instances if they exist
  if (sleepChartInst) { sleepChartInst.destroy(); sleepChartInst = null; }
  if (stepsChartInst) { stepsChartInst.destroy(); stepsChartInst = null; }

  const sleepEl = document.getElementById('sleepChart');
  const stepsEl = document.getElementById('stepsChart');
  if (!sleepEl || !stepsEl) return;

  // Sleep chart
  sleepChartInst = new Chart(sleepEl, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Sleep (hrs)',
          data: client.sleep_log,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.08)',
          pointBackgroundColor: client.sleep_log.map(v => v === null ? 'transparent' : (v >= 7 ? '#10b981' : v >= 6 ? '#f59e0b' : '#ef4444')),
          pointRadius: 5,
          tension: 0.35,
          fill: true,
          spanGaps: false
        },
        {
          label: '7h target',
          data: Array(days.length).fill(7),
          borderColor: 'rgba(16,185,129,0.3)',
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 10, ticks: { ...chartDefaults.scales.y.ticks, callback: v => v + 'h' } } } }
  });

  // Steps chart
  stepsChartInst = new Chart(stepsEl, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Steps',
          data: client.steps_log,
          backgroundColor: client.steps_log.map(v => v === null ? 'rgba(100,116,139,0.2)' : (v >= 8000 ? 'rgba(0,212,170,0.7)' : v >= 5000 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)')),
          borderRadius: 4
        }
      ]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, min: 0, ticks: { ...chartDefaults.scales.y.ticks, callback: v => (v / 1000).toFixed(0) + 'k' } }
      },
      plugins: {
        ...chartDefaults.plugins,
        annotation: { annotations: { line1: { type: 'line', yMin: 8000, yMax: 8000, borderColor: 'rgba(16,185,129,0.3)', borderDash: [6, 4] } } }
      }
    }
  });
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
