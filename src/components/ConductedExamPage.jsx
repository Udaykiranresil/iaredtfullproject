import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

/* ─── CONSTANTS ─── */
const MAX_SUBMITS = 3;
const MAX_VIOLATIONS = 3;

/* ─── KEYWORD EVALUATION ─── */
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "it", "in", "on", "of", "to", "and", "or", "but", "for", "with",
  "this", "that", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
  "does", "did", "will", "would", "could", "should", "may", "might", "can", "at", "by",
  "from", "as", "into", "about", "up", "out", "than", "then", "them", "they", "their",
  "there", "these", "those", "so", "if", "not", "no", "we", "you", "he", "she", "its",
  "our", "your", "his", "her", "my", "me", "am", "i"
]);
function extractKeywords(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}
function calculateMatchPercent(correct, user) {
  const ck = extractKeywords(correct), uk = extractKeywords(user);
  if (!ck.length) return 0;
  let matched = 0;
  ck.forEach(k => { if (uk.some(u => u.includes(k) || k.includes(u))) matched++; });
  return Math.round((matched / ck.length) * 100);
}
function getMarksFromPercent(pct) {
  if (pct >= 85) return 5;
  if (pct >= 65) return 4;
  if (pct >= 55) return 3;
  if (pct >= 45) return 2;
  if (pct >= 30) return 1;
  return 0;
}

/* ══════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════ */
function LoadingScreen({ message }) {
  return (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingCard}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingMsg}>{message}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DEVTOOLS BLOCKED SCREEN  ← NEW
══════════════════════════════════════════════ */
function DevToolsBlockedScreen({ onRetry }) {
  return (
    <div style={styles.loadingOverlay}>
      <div style={{ ...styles.loadingCard, gap: 20 }}>
        <div style={{ fontSize: 64 }}>🚫</div>
        <p style={{ color: "#dc2626", fontWeight: 800, fontSize: 18, maxWidth: 360, textAlign: "center", lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>
          Developer Tools Detected
        </p>
        <p style={{ color: "#6b7280", fontSize: 14, maxWidth: 340, textAlign: "center", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
          Please close Developer Tools (F12) before starting the exam. The exam cannot begin while DevTools is open.
        </p>
        <button style={{ ...styles.btnPrimary, marginTop: 8 }} onClick={onRetry}>
          🔄 Check Again
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   INSTRUCTIONS MODAL
══════════════════════════════════════════════ */
function InstructionsModal({ meta, onStart, onCancel, duration }) {
  const [agreed, setAgreed] = useState(false);
  const mins = Math.round(duration / 60);
  return (
    <div style={styles.backdrop}>
      <div style={styles.modalCard}>
        <div style={styles.accentBar} />
        <div style={{ ...styles.modalHeader, paddingTop: 22 }}>
          <div>
            <div style={styles.modalTitle}>📋 Exam Instructions</div>
            <div style={styles.instrSubtitle}>{meta.examName}</div>
          </div>
          <button style={styles.modalClose} onClick={onCancel}>×</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.instrChips}>
            <span style={{ ...styles.instrChip, ...styles.chipTime }}>⏱ {mins} Minutes</span>
            <span style={{ ...styles.instrChip, ...styles.chipQ }}>❓ Up to 10 Questions</span>
            <span style={{ ...styles.instrChip, ...styles.chipSubmit }}>✅ Max 3 Submits / Question</span>
          </div>

          <ul style={styles.instrRules}>
            {[
              { icon: "⛶", bg: "#fff7ed", title: "Fullscreen mandatory", desc: "The exam runs in fullscreen. Exiting counts as a violation." },
              { icon: "🔁", bg: "#fff7ed", title: "No tab or window switching", desc: "Leaving this page during the exam is detected and recorded." },
              { icon: "⌨️", bg: "#fff7ed", title: "Restricted keys blocked", desc: "Ctrl, Alt, Esc, F12 and other shortcuts are disabled." },
              { icon: "📋", bg: "#fff7ed", title: "Copy / Paste disabled", desc: "All clipboard operations are blocked. Type answers manually." },
              { icon: "🚫", bg: "#fff1f2", title: "No Developer Tools", desc: "Opening DevTools before or during the exam will block or auto-submit it." },
              { icon: "🚨", bg: "#fff1f2", title: "Max 3 violations", desc: "After 3 violations the exam is auto-submitted with current answers." },
              { icon: "🚪", bg: "#fff1f2", title: "No back / close", desc: "Closing the tab or navigating back will auto-submit your exam immediately." },
              { icon: "💡", bg: "#ede9fe", title: "Keyword-based evaluation", desc: "Marks (1–5) awarded per question based on keyword match percentage." },
            ].map((r, i) => (
              <li key={i} style={styles.instrRule}>
                <span style={{ ...styles.ruleIcon, background: r.bg }}>{r.icon}</span>
                <div>
                  <strong style={styles.ruleTitle}>{r.title}</strong>
                  <span style={styles.ruleDesc}>{r.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <label
            style={{ ...styles.agreeRow, ...(agreed ? styles.agreeRowChecked : {}) }}
            onClick={() => setAgreed(v => !v)}
          >
            <span style={{ ...styles.agreeBox, ...(agreed ? styles.agreeBoxChecked : {}) }}>
              {agreed && <span style={styles.checkmark} />}
            </span>
            <span style={styles.agreeText}>I have read and agree to all exam instructions</span>
          </label>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnGhost} onClick={onCancel}>Cancel</button>
          <button
            style={{ ...styles.btnPrimary, ...(agreed ? {} : styles.btnDisabled) }}
            disabled={!agreed}
            onClick={onStart}
          >
            Start Exam →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COUNTDOWN OVERLAY
══════════════════════════════════════════════ */
function CountdownOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["3", "2", "1", "🚀"];
  const msgs = ["Get ready…", "Get ready…", "Get ready…", "GO!"];

  useEffect(() => {
    if (step >= steps.length) { onDone(); return; }
    const t = setTimeout(() => setStep(s => s + 1), step === steps.length - 1 ? 650 : 900);
    return () => clearTimeout(t);
  }, [step]);

  if (step >= steps.length) return null;
  return (
    <div style={styles.countdownOverlay}>
      <div style={styles.countdownRing}>
        <span style={{ ...styles.countdownNum, ...(step === 3 ? styles.countdownGo : {}) }}>
          {steps[step]}
        </span>
      </div>
      <p style={styles.countdownMsg}>{msgs[step]}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VIOLATION MODAL
══════════════════════════════════════════════ */
function ViolationModal({ title, message, count, isFinal, onDismiss }) {
  const [remaining, setRemaining] = useState(isFinal ? null : 3);

  useEffect(() => {
    if (isFinal) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onDismiss(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinal, onDismiss]);

  return (
    <div style={styles.violationOverlay}>
      <div style={styles.violationCard}>
        <div style={{ fontSize: 52 }}>🚨</div>
        <h2 style={styles.vmTitle}>{title}</h2>
        <p style={styles.vmMsg}>{message}</p>
        <div style={styles.vmCount}>{count}</div>
        <button style={styles.vmBtn} onClick={onDismiss}>
          {isFinal ? "View Results" : `I Understand — Resume${remaining !== null ? ` (${remaining})` : ""}`}
        </button>
        {!isFinal && remaining !== null && (
          <div style={{ width: "100%", height: 4, background: "#fee2e2", borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
            <div style={{
              height: "100%", borderRadius: 999, background: "#dc2626",
              width: `${(remaining / 3) * 100}%`,
              transition: "width 1s linear",
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RELOAD CONFIRM MODAL  (Ctrl+R)
══════════════════════════════════════════════ */
function ReloadConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={styles.confirmOverlay}>
      <div style={styles.confirmCard}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔄</div>
        <h3 style={styles.confirmTitle}>Reload will submit your exam!</h3>
        <p style={styles.confirmDesc}>
          Reloading the page will <strong>auto-submit</strong> your exam with all current answers.
          This cannot be undone. Are you sure you want to continue?
        </p>
        <div style={styles.confirmActions}>
          <button style={styles.btnDanger} onClick={onConfirm}>Yes, Submit &amp; Reload</button>
          <button style={styles.btnGhost} onClick={onCancel}>Stay in Exam</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CONFIRM END MODAL
══════════════════════════════════════════════ */
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={styles.confirmOverlay}>
      <div style={styles.confirmCard}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h3 style={styles.confirmTitle}>Submit the Exam?</h3>
        <p style={styles.confirmDesc}>
          This will stop the timer and evaluate all your submitted answers. This action cannot be undone.
        </p>
        <div style={styles.confirmActions}>
          <button style={styles.btnDanger} onClick={onConfirm}>Yes, Submit</button>
          <button style={styles.btnGhost} onClick={onCancel}>Keep Going</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RESULT SCREEN
══════════════════════════════════════════════ */
function ResultScreen({ result, meta, onBack, saving }) {
  const deg = Math.round((result.finalGrade / 5) * 360);
  return (
    <div style={styles.resultOverlay}>
      <div style={styles.resultCard}>
        <div style={styles.resultTitleRow}>
          <span style={{ fontSize: 34 }}>🏆</span>
          <h2 style={styles.resultTitle}>Exam Complete!</h2>
        </div>
        <p style={styles.resultSubtitle}>{meta.examName}</p>

        <div style={{ ...styles.scoreCircle, background: `conic-gradient(#7c3aed ${deg}deg, #e0e7ff ${deg}deg)` }}>
          <div style={styles.scoreCircleInner}>
            <div style={styles.bigScore}>{result.finalGrade} / 5</div>
            <div style={styles.totalMarks}>Grade</div>
          </div>
        </div>

        <div style={styles.resultStats}>
          <div style={styles.statItem}>
            <span style={styles.statVal}>{result.avgPct}%</span>
            <span style={styles.statKey}>Avg Match</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statVal}>{result.attempted}/{result.total}</span>
            <span style={styles.statKey}>Attempted</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statVal}>{result.totalMarks}</span>
            <span style={styles.statKey}>Total Marks</span>
          </div>
        </div>

        {saving ? (
          <div style={styles.savingBadge}>⏳ Saving result to server…</div>
        ) : (
          <div style={styles.savedBadge}>✅ Result saved successfully</div>
        )}

        <button
          style={{ ...styles.btnPrimary, width: "100%", justifyContent: "center", padding: "14px", marginTop: 16 }}
          onClick={onBack}
          disabled={saving}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN CONDUCTED EXAM PAGE
══════════════════════════════════════════════ */
export default function ConductedExamPage() {
  const { exam_id } = useParams();
  const navigate = useNavigate();

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState("Loading exam…");
  const [examMeta, setExamMeta] = useState(null);
  const [phase, setPhase] = useState("instructions");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [violationModal, setViolationModal] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  /* ── NEW: DevTools blocked state ── */
  const [devToolsBlocked, setDevToolsBlocked] = useState(false);

  /* ── Security refs ── */
  const phaseRef = useRef("instructions");
  const violationsRef = useRef(0);
  const secActiveRef = useRef(false);
  const violCooldownRef = useRef(false);
  const modalOpenRef = useRef(false);
  const endTestCalledRef = useRef(false);
  const timerRef = useRef(null);
  const handleEndTestRef = useRef(null);
  const durationRef = useRef(1800);
  const questionsRef = useRef([]);

  // ── Fullscreen guardian + DevTools detector refs ──
  const fullscreenGuardRef = useRef(null);
  const devToolsIntervalRef = useRef(null);

  /* ── Utility: single DevTools timing check ── */
  const isDevToolsOpen = useCallback(() => {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    return performance.now() - start > 100;
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { violationsRef.current = violations; }, [violations]);
  useEffect(() => { modalOpenRef.current = violationModal !== null; }, [violationModal]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  /* ── Redirect if not logged in ── */
  useEffect(() => { if (!user) navigate("/login"); }, []);

  /* ── Fetch exam data ── */
  useEffect(() => { if (!user || !exam_id) return; fetchExam(); }, [exam_id]);

  const fetchExam = async () => {
    const isVerified = localStorage.getItem("key_verified");
    if (!isVerified) {
      setLoadMsg("Access denied. Please verify your exam key first.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadMsg("Verifying access…");

    const { data: existingResult } = await supabase
      .from("exam_results").select("id")
      .eq("exam_id", parseInt(exam_id)).eq("st_id", user.st_id).maybeSingle();

    if (existingResult) {
      setLoadMsg("You have already submitted this exam. Results have been recorded.");
      setLoading(false);
      return;
    }

    setLoadMsg("Fetching exam details…");
    const { data: exam, error: examErr } = await supabase
      .from("conduct_exam").select(`*, subjects(id, label)`).eq("exam_id", exam_id).single();

    const now = new Date();
    if (new Date(exam.end_time + "Z").getTime() < now.getTime()) {
      setLoadMsg("This exam has already ended.");
      setLoading(false);
      return; 
    }
    if (examErr || !exam) { setLoadMsg("Exam not found."); return; }

    durationRef.current = 30 * 60;
    setSecondsLeft(durationRef.current);
    setExamMeta({
      examName: exam.exam_name,
      subjectLabel: exam.subjects?.label || "—",
      subjectId: exam.subject_id,
      semId: exam.sem_id,
      branchId: exam.branch_id,
    });

    setLoadMsg("Loading questions…");
    const { data: modules } = await supabase.from("modules").select("id, label").eq("subject_id", exam.subject_id);
    if (!modules?.length) { setLoadMsg("No modules found for this subject."); setLoading(false); return; }

    const sortedModules = modules.sort((a, b) => {
      const numA = parseInt(a.label.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.label.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });
    const moduleMap = {
      1: sortedModules[0]?.id, 2: sortedModules[1]?.id, 3: sortedModules[2]?.id,
      4: sortedModules[3]?.id, 5: sortedModules[4]?.id,
    };

    let moduleFilter = [];
    if (exam.exam_name === "DT 1") moduleFilter = [moduleMap[1], moduleMap[2], moduleMap[3]];
    else if (exam.exam_name === "DT 2") moduleFilter = [moduleMap[3], moduleMap[4], moduleMap[5]];

    const { data: qs, error: qErr } = await supabase.from("dt_questions").select("*")
      .eq("sem_id", exam.sem_id).eq("branch_id", exam.branch_id)
      .eq("subject_id", exam.subject_id).in("module_id", moduleFilter);

    if (qErr || !qs?.length) { setLoadMsg("No questions found for this exam's subject."); setLoading(false); return; }

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    let finalQs = [];
    if (exam.exam_name === "DT 1") {
      finalQs = [
        ...shuffle(qs.filter(q => q.module_id === moduleMap[1])).slice(0, 4),
        ...shuffle(qs.filter(q => q.module_id === moduleMap[2])).slice(0, 4),
        ...shuffle(qs.filter(q => q.module_id === moduleMap[3])).slice(0, 2),
      ];
    } else if (exam.exam_name === "DT 2") {
      finalQs = [
        ...shuffle(qs.filter(q => q.module_id === moduleMap[3])).slice(0, 2),
        ...shuffle(qs.filter(q => q.module_id === moduleMap[4])).slice(0, 4),
        ...shuffle(qs.filter(q => q.module_id === moduleMap[5])).slice(0, 4),
      ];
    }

    const shuffled = [...finalQs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.map(q => ({
      question: q.question, correctAnswer: q.answer,
      userAnswer: "", submitCount: 0, lastMatchPct: 0, lastMarks: 0, isAttempted: false,
    })));
    setLoading(false);
  };

  /* ─────────────────────────────────────────────
     TIMER
  ───────────────────────────────────────────── */
  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleEndTestRef.current?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);
  const formatTime = (t) => {
    const m = Math.floor(t / 60), s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  /* ─────────────────────────────────────────────
     FULLSCREEN
  ───────────────────────────────────────────── */
  const enterFullscreen = useCallback((cb) => {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el).then(() => cb?.()).catch(() => cb?.());
    else cb?.();
  }, []);

  const exitFullscreen = useCallback(() => {
    const ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (ex && document.fullscreenElement) ex.call(document);
  }, []);

  /* ─────────────────────────────────────────────
     FULLSCREEN GUARDIAN
  ───────────────────────────────────────────── */
  const startFullscreenGuard = useCallback(() => {
    clearInterval(fullscreenGuardRef.current);
    fullscreenGuardRef.current = setInterval(() => {
      if (phaseRef.current !== "test") return;
      if (!document.fullscreenElement && !modalOpenRef.current) {
        triggerViolation("Fullscreen tampered or exited forcefully");
        setTimeout(() => {
          if (phaseRef.current === "test") {
            const el = document.documentElement;
            const req = el.requestFullscreen || el.webkitRequestFullscreen
              || el.mozRequestFullScreen || el.msRequestFullscreen;
            if (req) req.call(el).catch(() => {});
          }
        }, 800);
      }
    }, 1000);
  }, []);

  const stopFullscreenGuard = useCallback(() => {
    clearInterval(fullscreenGuardRef.current);
  }, []);

  /* ─────────────────────────────────────────────
     END TEST
  ───────────────────────────────────────────── */
  const handleEndTest = useCallback(() => {
    if (endTestCalledRef.current) return;
    endTestCalledRef.current = true;

    stopTimer();
    disableSecurityListeners();
    stopFullscreenGuard();
    setShowConfirm(false);
    setShowReloadConfirm(false);

    setQuestions(prev => {
      let totalMarks = 0, totalPct = 0, attempted = 0;
      prev.forEach(q => {
        if (q.isAttempted) { attempted++; totalMarks += q.lastMarks; totalPct += q.lastMatchPct; }
      });
      const avgPct = attempted > 0 ? Math.round(totalPct / attempted) : 0;
      let finalGrade = 0;
      if (totalMarks >= 41) finalGrade = 5;
      else if (totalMarks >= 31) finalGrade = 4;
      else if (totalMarks >= 21) finalGrade = 3;
      else if (totalMarks >= 11) finalGrade = 2;
      else if (totalMarks >= 1) finalGrade = 1;

      const resultObj = { totalMarks, finalGrade, avgPct, attempted, total: prev.length };
      setResult(resultObj);

      setSaving(true);
      const u = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
      supabase.from("exam_results").insert([{
        exam_id: parseInt(exam_id),
        st_id: u?.st_id,
        total_marks: totalMarks,
        final_grade: finalGrade,
        avg_match_pct: avgPct,
        attempted_questions: attempted,
        total_questions: prev.length,
        violations_count: violationsRef.current,
        submitted_at: new Date().toISOString(),
      }]).then(({ error }) => {
        if (error) console.error("Result save error:", error);
        setSaving(false);
      });

      return prev;
    });

    setPhase("result");
  }, [stopTimer, exam_id]);

  useEffect(() => { handleEndTestRef.current = handleEndTest; }, [handleEndTest]);

  /* ─────────────────────────────────────────────
     SECURITY
  ───────────────────────────────────────────── */
  const triggerViolation = useCallback((reason) => {
    if (!secActiveRef.current || phaseRef.current !== "test") return;
    if (modalOpenRef.current) return;
    if (violCooldownRef.current) return;
    violCooldownRef.current = true;
    setTimeout(() => { violCooldownRef.current = false; }, 2000);

    setViolations(prev => {
      const next = prev + 1;
      violationsRef.current = next;
      if (next >= MAX_VIOLATIONS) {
        secActiveRef.current = false;
        setViolationModal({ title: "Exam Auto-Submitted", message: `Too many violations (${next}). Your exam has been auto-submitted.`, isFinal: true, count: `Violation ${next} of ${MAX_VIOLATIONS}` });
      } else {
        setViolationModal({ title: "Malpractice Detected!", message: reason, isFinal: false, count: `Violation ${next} of ${MAX_VIOLATIONS}` });
      }
      return next;
    });
  }, []);

  const _secBlock = useCallback((e) => { if (secActiveRef.current) e.preventDefault(); }, []);

  const _secKeys = useCallback((e) => {
    if (!secActiveRef.current) return;
    const inTA = document.activeElement?.id === "examAnswerTextarea";
    if (e.key === "Tab" && inTA) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      if (phaseRef.current === "test") setShowReloadConfirm(true);
      return;
    }

    if (["Escape", "F12", "F11"].includes(e.key)) { e.preventDefault(); triggerViolation("Blocked key: " + e.key); return; }
    if (e.ctrlKey && ["c", "v", "x", "u", "s", "p", "a"].includes(e.key.toLowerCase())) { e.preventDefault(); triggerViolation("Blocked shortcut: Ctrl+" + e.key); return; }
    if (e.ctrlKey && e.shiftKey) { e.preventDefault(); triggerViolation("Blocked Ctrl+Shift"); return; }
    if (e.metaKey) { e.preventDefault(); triggerViolation("Blocked Meta key"); return; }
    if (e.altKey && e.key !== "AltGraph") { e.preventDefault(); triggerViolation("Blocked Alt key"); return; }
  }, [triggerViolation]);

  const _secVisibility = useCallback(() => {
    if (!secActiveRef.current || !document.hidden) return;
    if (modalOpenRef.current || violCooldownRef.current) return;
    triggerViolation("Tab switch detected");
  }, [triggerViolation]);

  const _secBlur = useCallback(() => {
    if (!secActiveRef.current) return;
    if (modalOpenRef.current || violCooldownRef.current) return;
    triggerViolation("Window focus lost");
  }, [triggerViolation]);

  const _secFullscreen = useCallback(() => {
    if (!secActiveRef.current || modalOpenRef.current) return;
    if (!document.fullscreenElement) triggerViolation("Exited fullscreen");
  }, [triggerViolation]);

  const _secBeforeUnload = useCallback((e) => {
    if (phaseRef.current !== "test") return;
    e.preventDefault();
    e.returnValue = "";

    if (!endTestCalledRef.current) {
      endTestCalledRef.current = true;
      const qs = questionsRef.current;
      let totalMarks = 0, totalPct = 0, attempted = 0;
      qs.forEach(q => {
        if (q.isAttempted) { attempted++; totalMarks += q.lastMarks; totalPct += q.lastMatchPct; }
      });
      const avgPct = attempted > 0 ? Math.round(totalPct / attempted) : 0;
      let finalGrade = 0;
      if (totalMarks >= 41) finalGrade = 5;
      else if (totalMarks >= 31) finalGrade = 4;
      else if (totalMarks >= 21) finalGrade = 3;
      else if (totalMarks >= 11) finalGrade = 2;
      else if (totalMarks >= 1) finalGrade = 1;

      const u = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
      const payload = JSON.stringify({
        exam_id: parseInt(exam_id),
        st_id: u?.st_id,
        total_marks: totalMarks,
        final_grade: finalGrade,
        avg_match_pct: avgPct,
        attempted_questions: attempted,
        total_questions: qs.length,
        violations_count: violationsRef.current,
        submitted_at: new Date().toISOString(),
      });
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        navigator.sendBeacon(
          `${supabaseUrl}/rest/v1/exam_results`,
          new Blob([payload], { type: "application/json" })
        );
      }
    }
  }, [exam_id]);

  const _secPopState = useCallback(() => {
    if (phaseRef.current !== "test") return;
    window.history.pushState(null, "", window.location.href);
    handleEndTestRef.current?.();
  }, []);

  const enableSecurityListeners = useCallback(() => {
    secActiveRef.current = true;
    document.addEventListener("contextmenu", _secBlock);
    document.addEventListener("copy", _secBlock);
    document.addEventListener("paste", _secBlock);
    document.addEventListener("cut", _secBlock);
    document.addEventListener("dragstart", _secBlock);
    document.addEventListener("keydown", _secKeys);
    document.addEventListener("visibilitychange", _secVisibility);
    window.addEventListener("blur", _secBlur);
    document.addEventListener("fullscreenchange", _secFullscreen);
    window.addEventListener("beforeunload", _secBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", _secPopState);

    /* ── DevTools detector during exam: auto-submit immediately ── */
    devToolsIntervalRef.current = setInterval(() => {
      if (phaseRef.current !== "test") return;
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - start > 100) {
        clearInterval(devToolsIntervalRef.current);
        secActiveRef.current = false;
        // Force submit — no violation warning, immediate end
        handleEndTestRef.current?.();
      }
    }, 2000);
  }, [_secBlock, _secKeys, _secVisibility, _secBlur, _secFullscreen, _secBeforeUnload, _secPopState]);

  const disableSecurityListeners = useCallback(() => {
    secActiveRef.current = false;
    document.removeEventListener("contextmenu", _secBlock);
    document.removeEventListener("copy", _secBlock);
    document.removeEventListener("paste", _secBlock);
    document.removeEventListener("cut", _secBlock);
    document.removeEventListener("dragstart", _secBlock);
    document.removeEventListener("keydown", _secKeys);
    document.removeEventListener("visibilitychange", _secVisibility);
    window.removeEventListener("blur", _secBlur);
    document.removeEventListener("fullscreenchange", _secFullscreen);
    window.removeEventListener("beforeunload", _secBeforeUnload);
    window.removeEventListener("popstate", _secPopState);
    clearInterval(devToolsIntervalRef.current);
    exitFullscreen();
  }, [_secBlock, _secKeys, _secVisibility, _secBlur, _secFullscreen, _secBeforeUnload, _secPopState, exitFullscreen]);

  useEffect(() => {
    return () => {
      disableSecurityListeners();
      stopTimer();
      stopFullscreenGuard();
    };
  }, [disableSecurityListeners, stopTimer, stopFullscreenGuard]);

  /* ─────────────────────────────────────────────
     START TEST  ← UPDATED: DevTools pre-check
  ───────────────────────────────────────────── */
  const handleStartTest = useCallback(() => {
    // Gate 1: block if DevTools is open at the moment "Start Exam" is clicked
    if (isDevToolsOpen()) {
      setDevToolsBlocked(true);
      return;
    }
    enterFullscreen(() => {
      setCurrentIndex(0);
      setSecondsLeft(durationRef.current);
      setViolations(0);
      violationsRef.current = 0;
      endTestCalledRef.current = false;
      setPhase("countdown");
    });
  }, [enterFullscreen, isDevToolsOpen]);

  /* ── "Check Again" on the blocked screen ── */
  const handleDevToolsRetry = useCallback(() => {
    if (!isDevToolsOpen()) {
      setDevToolsBlocked(false);   // DevTools closed → go back to instructions
    }
    // If still open, stay on blocked screen (state unchanged)
  }, [isDevToolsOpen]);

  const handleCountdownDone = useCallback(() => {
    setPhase("test");
    startTimer();
    enableSecurityListeners();
    startFullscreenGuard();
  }, [startTimer, enableSecurityListeners, startFullscreenGuard]);

  /* ─────────────────────────────────────────────
     DISMISS VIOLATION
  ───────────────────────────────────────────── */
  const dismissViolation = useCallback(() => {
    const isFinal = violationModal?.isFinal;
    setViolationModal(null);
    modalOpenRef.current = false;
    if (isFinal) {
      handleEndTest();
    } else {
      secActiveRef.current = false;
      enterFullscreen(() => {
        setTimeout(() => {
          if (phaseRef.current === "test") {
            secActiveRef.current = true;
            violCooldownRef.current = false;
          }
        }, 400);
      });
    }
  }, [violationModal, handleEndTest, enterFullscreen]);

  /* ─────────────────────────────────────────────
     RELOAD CONFIRM
  ───────────────────────────────────────────── */
  const handleReloadConfirm = useCallback(() => {
    handleEndTestRef.current?.();
  }, []);

  const handleReloadCancel = useCallback(() => {
    setShowReloadConfirm(false);
  }, []);

  /* ─────────────────────────────────────────────
     ANSWER & SUBMIT
  ───────────────────────────────────────────── */
  const submitQuestion = useCallback(() => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = { ...updated[currentIndex] };
      if (q.submitCount >= MAX_SUBMITS) return prev;
      q.submitCount++;
      q.isAttempted = true;
      const pct = q.userAnswer.trim() ? calculateMatchPercent(q.correctAnswer, q.userAnswer) : 0;
      const marks = q.userAnswer.trim() ? getMarksFromPercent(pct) : 0;
      q.lastMatchPct = pct;
      q.lastMarks = marks;
      updated[currentIndex] = q;
      return updated;
    });
  }, [currentIndex]);

  const updateAnswer = useCallback((val) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], userAnswer: val };
      return updated;
    });
  }, [currentIndex]);

  /* ─────────────────────────────────────────────
     KEYBOARD NAV
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== "test") return;
    const handleKey = (e) => {
      if (document.activeElement?.id === "examAnswerTextarea") return;
      if (e.key === "ArrowRight") setCurrentIndex(i => Math.min(i + 1, questions.length - 1));
      if (e.key === "ArrowLeft") setCurrentIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, questions.length]);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  if (!user) return null;

  if (loading) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <LoadingScreen message={loadMsg} />
    </>
  );

  /* ── NEW: DevTools blocked screen (shown over instructions) ── */
  if (devToolsBlocked) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <DevToolsBlockedScreen onRetry={handleDevToolsRetry} />
    </>
  );

  if (!examMeta) {
    const isAlreadyDone = loadMsg.includes("already submitted");
    const isDenied = loadMsg.includes("Access denied");
    return (
      <div style={styles.loadingOverlay}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.loadingCard}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>
            {isAlreadyDone ? "✅" : isDenied ? "🔒" : "❌"}
          </div>
          <p style={{ color: isAlreadyDone ? "#15803d" : "#dc2626", fontWeight: 700, fontSize: 16, maxWidth: 340, textAlign: "center", lineHeight: 1.5 }}>
            {loadMsg}
          </p>
          <button style={{ ...styles.btnPrimary, marginTop: 20 }} onClick={() => navigate("/exam-dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (phase === "instructions") {
    return (
      <InstructionsModal
        meta={examMeta}
        duration={durationRef.current}
        onStart={handleStartTest}
        onCancel={() => navigate("/exam-dashboard")}
      />
    );
  }

  if (phase === "countdown") return <CountdownOverlay onDone={handleCountdownDone} />;

  if (phase === "result" && result) {
    return <ResultScreen result={result} meta={examMeta} saving={saving} onBack={() => navigate("/exam-dashboard")} />;
  }

  /* ── TEST PHASE ── */
  const q = questions[currentIndex];
  if (!q) return null;

  const isMaxed = q.submitCount >= MAX_SUBMITS;
  const attempted = questions.filter(x => x.isAttempted).length;
  const isWarning = secondsLeft <= 50;

  return (
    <div style={styles.examContainer}>

      {violationModal && (
        <ViolationModal
          title={violationModal.title}
          message={violationModal.message}
          count={violationModal.count}
          isFinal={violationModal.isFinal}
          onDismiss={dismissViolation}
        />
      )}

      {showConfirm && (
        <ConfirmModal onConfirm={handleEndTest} onCancel={() => setShowConfirm(false)} />
      )}

      {showReloadConfirm && (
        <ReloadConfirmModal onConfirm={handleReloadConfirm} onCancel={handleReloadCancel} />
      )}

      {/* ── HEADER ── */}
      <div style={styles.testHeader}>
        <div style={styles.testHeaderTitle}>
          <strong>{examMeta.examName}</strong> › {examMeta.subjectLabel}
        </div>
        <div style={styles.testHeaderRight}>
          <div style={{ ...styles.testTimer, ...(isWarning ? styles.testTimerWarning : {}) }}>
            {formatTime(secondsLeft)}
          </div>
          <div style={{ ...styles.violationCounter, ...(violations >= MAX_VIOLATIONS ? styles.violationCounterMax : {}) }}>
            ⚠ Violations: <span>{violations}</span>/{MAX_VIOLATIONS}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={styles.testBody}>

        {/* Question sidebar */}
        <div style={styles.testSidebar}>
          {questions.map((q2, i) => (
            <button
              key={i}
              style={{
                ...styles.qNavBtn,
                ...(q2.isAttempted ? styles.qNavBtnSubmitted : {}),
                ...(i === currentIndex ? (q2.isAttempted ? styles.qNavBtnCurrentSubmitted : styles.qNavBtnCurrent) : {}),
              }}
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
              {q2.isAttempted && <span style={styles.submitDots}>{"●".repeat(q2.submitCount)}</span>}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div style={styles.testMain}>
          <div style={styles.testQuestionArea}>

            <div style={styles.questionMeta}>
              <span style={styles.questionLabel}>Question {currentIndex + 1} of {questions.length}</span>
              <div style={styles.submitStatusRow}>
                <span style={{ ...styles.badge, ...(isMaxed ? styles.badgeMaxed : styles.badgeAttempts) }}>
                  {q.submitCount} / {MAX_SUBMITS} Submits
                </span>
                {q.isAttempted && <span style={{ ...styles.badge, ...styles.badgeSubmitted }}>✓ Submitted</span>}
              </div>
            </div>

            <div style={styles.questionText}>{q.question}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={styles.answerLabel}>Your Answer</div>
              <textarea
                id="examAnswerTextarea"
                style={{ ...styles.answerTextarea, ...(isMaxed ? styles.answerTextareaDisabled : {}) }}
                placeholder="Type your answer here…"
                rows={5}
                disabled={isMaxed}
                value={q.userAnswer}
                onChange={e => updateAnswer(e.target.value)}
              />
              <button
                style={{ ...styles.btnPrimary, alignSelf: "flex-start", ...(isMaxed ? styles.btnDisabled : {}) }}
                disabled={isMaxed}
                onClick={submitQuestion}
              >
                {isMaxed ? "🔒 Max Submits Reached" : "Submit Answer"}
              </button>
            </div>

            {q.isAttempted && (
              <div style={styles.matchResultBox}>
                <div style={styles.matchBarWrap}>
                  <div style={styles.matchBarLabel}>Keyword Match</div>
                  <div style={styles.matchBarBg}>
                    <div style={{ ...styles.matchBarFill, width: q.lastMatchPct + "%" }} />
                  </div>
                </div>
                <div style={styles.matchPctText}>{q.lastMatchPct}%</div>
                <div style={styles.matchMarksText}>Marks: <strong style={{ color: "#1e1b4b", fontSize: 15 }}>{q.lastMarks}</strong>/5</div>
              </div>
            )}

            {isMaxed && (
              <div style={styles.correctAnswerBox}>
                <div style={styles.answerTitle}>✔ Correct Answer</div>
                <div style={styles.correctAnswerText}>{q.correctAnswer}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={styles.testFooter}>
            <div style={styles.footerLeft}>
              <button
                style={{ ...styles.btnNav, ...(currentIndex === 0 ? styles.btnNavDisabled : {}) }}
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
              >← Prev</button>
            </div>
            <div style={styles.footerCenter}>
              <span style={styles.progressInfo}>
                <span style={{ color: "#7c3aed" }}>{attempted}</span> / {questions.length} Attempted
              </span>
            </div>
            <div style={styles.footerRight}>
              <button
                style={{ ...styles.btnNav, ...(currentIndex === questions.length - 1 ? styles.btnNavDisabled : {}) }}
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(i => Math.min(i + 1, questions.length - 1))}
              >Next →</button>
              <button style={styles.btnAccent} onClick={() => setShowConfirm(true)}>END EXAM</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════ */
const styles = {
  loadingOverlay: { position: "fixed", inset: 0, background: "#f5f4ff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  loadingCard: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  loadingSpinner: { width: 44, height: 44, border: "4px solid #e0e7ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingMsg: { fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#4338ca", fontWeight: 600 },
  examContainer: { position: "fixed", inset: 0, background: "#f5f4ff", display: "flex", flexDirection: "column", fontFamily: "'DM Sans','Segoe UI',sans-serif", zIndex: 10000 },
  testHeader: { background: "#fff", borderBottom: "2px solid #e8e6ff", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 2px 12px rgba(67,56,202,0.08)", gap: 16 },
  testHeaderTitle: { fontSize: 14, fontWeight: 600, color: "#4338ca", fontFamily: "'Space Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  testHeaderRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  testTimer: { background: "#f0effe", border: "2px solid #c4b5fd", borderRadius: 12, padding: "8px 18px", fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: "#6d28d9", letterSpacing: 2, minWidth: 100, textAlign: "center" },
  testTimerWarning: { background: "#fff1f2", borderColor: "#fca5a5", color: "#dc2626" },
  violationCounter: { background: "#fff7ed", border: "2px solid #fdba74", color: "#c2410c", borderRadius: 12, padding: "6px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1 },
  violationCounterMax: { background: "#fee2e2", borderColor: "#f87171", color: "#dc2626" },
  testBody: { flex: 1, display: "flex", overflow: "hidden" },
  testSidebar: { width: 88, background: "#fff", borderRight: "2px solid #e8e6ff", overflowY: "auto", flexShrink: 0, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "2px 0 8px rgba(67,56,202,0.05)" },
  qNavBtn: { width: "100%", aspectRatio: "1", borderRadius: 12, border: "2px solid #e0e7ff", background: "#f8f7ff", color: "#9ca3af", fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", position: "relative", transition: "all 0.15s ease" },
  qNavBtnSubmitted: { background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" },
  qNavBtnCurrent: { background: "linear-gradient(135deg,#6366f1,#7c3aed)", borderColor: "transparent", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,.35)" },
  qNavBtnCurrentSubmitted: { background: "linear-gradient(135deg,#059669,#10b981)", borderColor: "transparent", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,.35)" },
  submitDots: { position: "absolute", top: 2, right: 4, fontSize: 6, letterSpacing: -1, opacity: 0.7 },
  testMain: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  testQuestionArea: { flex: 1, padding: "32px 40px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, background: "#f5f4ff" },
  questionMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  questionLabel: { fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: 1, textTransform: "uppercase" },
  submitStatusRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  badge: { padding: "4px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono',monospace" },
  badgeAttempts: { background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", color: "#92400e" },
  badgeMaxed: { background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", color: "#dc2626" },
  badgeSubmitted: { background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", color: "#15803d" },
  questionText: { background: "#fff", border: "1px solid #c4b5fd", borderRadius: 14, padding: "26px 30px", fontSize: 17, fontWeight: 600, lineHeight: 1.65, color: "#1e1b4b", boxShadow: "0 4px 24px rgba(67,56,202,0.10)" },
  answerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b7280", fontFamily: "'Space Mono',monospace" },
  answerTextarea: { width: "100%", background: "#fff", border: "1px solid #c4b5fd", borderRadius: 14, padding: "16px 20px", fontFamily: "'DM Sans','Segoe UI',sans-serif", fontSize: 15, color: "#1e1b4b", resize: "vertical", minHeight: 140, outline: "none", transition: "border-color 0.15s,box-shadow 0.15s" },
  answerTextareaDisabled: { background: "#eae9f5", color: "#6b7280", cursor: "not-allowed" },
  matchResultBox: { background: "#fff", border: "1px solid #c4b5fd", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 4px 24px rgba(67,56,202,0.10)" },
  matchBarWrap: { flex: 1, minWidth: 140 },
  matchBarLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 6, fontFamily: "'Space Mono',monospace" },
  matchBarBg: { height: 8, background: "#eae9f5", borderRadius: 999, overflow: "hidden", border: "1px solid #e0e7ff" },
  matchBarFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#6366f1,#7c3aed)", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" },
  matchPctText: { fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: "#7c3aed", whiteSpace: "nowrap" },
  matchMarksText: { fontSize: 12, fontWeight: 700, color: "#6b7280", whiteSpace: "nowrap" },
  correctAnswerBox: { padding: "14px 16px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #86efac" },
  answerTitle: { fontSize: 12, fontWeight: 700, color: "#16a34a", marginBottom: 6, textTransform: "uppercase" },
  correctAnswerText: { fontSize: 14, color: "#065f46", lineHeight: 1.5 },
  testFooter: { background: "#fff", borderTop: "1px solid #e0e7ff", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12, boxShadow: "0 -2px 8px rgba(0,0,0,.04)" },
  footerLeft: { display: "flex", alignItems: "center", gap: 10 },
  footerCenter: { display: "flex", alignItems: "center", gap: 10 },
  footerRight: { display: "flex", alignItems: "center", gap: 10 },
  progressInfo: { fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#6b7280", fontWeight: 700 },
  btnNav: { border: "1px solid #c4b5fd", background: "#eae9f5", color: "#4a4780", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.15s ease" },
  btnNavDisabled: { opacity: 0.3, cursor: "not-allowed" },
  btnPrimary: { background: "linear-gradient(135deg,#4338ca,#7c3aed)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(124,58,237,0.3)", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  btnAccent: { background: "linear-gradient(135deg,#4338ca,#7c3aed)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans','Segoe UI',sans-serif", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" },
  btnGhost: { background: "transparent", color: "#4a4780", border: "1px solid #c4b5fd", padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  btnDanger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(30,27,75,.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)", zIndex: 9000 },
  modalCard: { background: "#fff", border: "1px solid #c4b5fd", borderRadius: 24, width: "100%", maxWidth: 680, boxShadow: "0 24px 80px rgba(67,56,202,.22)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  accentBar: { height: 3, background: "linear-gradient(90deg,#6366f1,#7c3aed)", borderRadius: "24px 24px 0 0", flexShrink: 0 },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px 0", flexShrink: 0 },
  modalTitle: { fontFamily: "'DM Sans',sans-serif", fontSize: 19, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-.3px" },
  instrSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 4, fontFamily: "'Space Mono',monospace" },
  modalClose: { width: 32, height: 32, borderRadius: 8, border: "none", background: "#eae9f5", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  modalBody: { padding: "20px 28px", overflowY: "auto", flex: 1 },
  modalFooter: { padding: "20px 28px 26px", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0, borderTop: "1px solid #e0e7ff" },
  instrChips: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  instrChip: { padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: "'Space Mono',monospace", letterSpacing: ".3px" },
  chipTime: { background: "rgba(99,102,241,.1)", color: "#4338ca", border: "1px solid rgba(99,102,241,.2)" },
  chipQ: { background: "rgba(16,185,129,.1)", color: "#059669", border: "1px solid rgba(16,185,129,.2)" },
  chipSubmit: { background: "#ede9fe", color: "#7c3aed", border: "1px solid rgba(124,58,237,.2)" },
  instrRules: { listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  instrRule: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#eae9f5", border: "1px solid #e0e7ff" },
  ruleIcon: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 },
  ruleTitle: { display: "block", fontSize: 13, fontWeight: 600, color: "#1e1b4b" },
  ruleDesc: { display: "block", fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginTop: 2 },
  agreeRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, marginTop: 14, background: "rgba(34,197,94,.05)", border: "1px solid rgba(34,197,94,.2)", cursor: "pointer", userSelect: "none" },
  agreeRowChecked: { background: "rgba(34,197,94,.08)", borderColor: "rgba(34,197,94,.35)" },
  agreeBox: { width: 20, height: 20, borderRadius: 6, border: "2px solid rgba(34,197,94,.4)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  agreeBoxChecked: { background: "#10b981", borderColor: "#10b981" },
  checkmark: { display: "block", width: 5, height: 9, border: "2px solid #fff", borderTop: "none", borderLeft: "none", transform: "rotate(45deg) translateY(-1px)" },
  agreeText: { fontSize: 13, fontWeight: 600, color: "#15803d" },
  countdownOverlay: { position: "fixed", inset: 0, background: "#312e81", zIndex: 11500, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 },
  countdownRing: { width: 160, height: 160, borderRadius: "50%", border: "2px solid rgba(165,180,252,.3)", display: "flex", alignItems: "center", justifyContent: "center" },
  countdownNum: { fontFamily: "'Space Mono',monospace", fontSize: 80, fontWeight: 700, color: "#a78bfa", lineHeight: 1 },
  countdownGo: { fontSize: 52 },
  countdownMsg: { fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: "rgba(165,180,252,.6)", letterSpacing: 3, textTransform: "uppercase" },
  violationOverlay: { position: "fixed", inset: 0, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", zIndex: 10400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 20 },
  violationCard: { background: "rgba(255,255,255,0.95)", border: "2px solid #000", borderRadius: 16, padding: "30px 40px", textAlign: "center", boxShadow: "0 12px 30px rgba(0,0,0,.2)", maxWidth: 420, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  vmTitle: { fontFamily: "'DM Sans',sans-serif", fontSize: 26, fontWeight: 800, color: "#111" },
  vmMsg: { fontSize: 15, color: "#222", lineHeight: 1.65, maxWidth: 400 },
  vmCount: { fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#333", fontWeight: 700 },
  vmBtn: { background: "#dc2626", color: "#fff", border: "2px solid #b91c1c", borderRadius: 12, padding: "12px 26px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8, boxShadow: "0 6px 18px rgba(220,38,38,0.4)" },
  confirmOverlay: { position: "fixed", inset: 0, background: "rgba(30,27,75,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10100, padding: 20, backdropFilter: "blur(6px)" },
  confirmCard: { background: "#fff", border: "1px solid #c4b5fd", borderRadius: 24, padding: 36, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(67,56,202,.22)" },
  confirmTitle: { fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b", marginBottom: 8 },
  confirmDesc: { fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 },
  confirmActions: { display: "flex", gap: 10, justifyContent: "center" },
  resultOverlay: { position: "fixed", inset: 0, background: "#f0f0f8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10200, padding: 24, overflowY: "auto" },
  resultCard: { background: "#fff", border: "1px solid #c4b5fd", borderRadius: 24, padding: "48px 44px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(67,56,202,.22)" },
  resultTitleRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 6 },
  resultTitle: { fontFamily: "'DM Sans',sans-serif", fontSize: 26, fontWeight: 800, color: "#1e1b4b" },
  resultSubtitle: { fontSize: 12, color: "#6b7280", marginBottom: 36, fontFamily: "'Space Mono',monospace" },
  scoreCircle: { width: 148, height: 148, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", position: "relative" },
  scoreCircleInner: { position: "absolute", inset: 12, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" },
  bigScore: { fontFamily: "'Space Mono',monospace", fontSize: 28, fontWeight: 700, color: "#7c3aed" },
  totalMarks: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#6b7280", marginTop: 5, fontFamily: "'Space Mono',monospace" },
  resultStats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 },
  statItem: { background: "#ede9fe", border: "1px solid #e0e7ff", borderRadius: 14, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" },
  statVal: { fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color: "#7c3aed" },
  statKey: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#6b7280", marginTop: 4, fontFamily: "'Space Mono',monospace" },
  savingBadge: { background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#854d0e" },
  savedBadge: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#15803d" },
};