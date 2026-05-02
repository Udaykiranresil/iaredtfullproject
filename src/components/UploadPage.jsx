import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

/* ─────────────────────── CSS ─────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg: #0d0f14;
  --surface: #141720;
  --surface2: #1a1e2a;
  --surface3: #1f2435;
  --border: rgba(255,255,255,0.07);
  --border-hi: rgba(255,255,255,0.14);
  --accent: #5b8dee;
  --accent-dim: rgba(91,141,238,0.12);
  --accent-glow: rgba(91,141,238,0.25);
  --text: #e8ecf4;
  --text2: #8a92a8;
  --text3: #5a6076;
  --red: #f05252;
  --red-dim: rgba(240,82,82,0.12);
  --green: #34d399;
  --green-dim: rgba(52,211,153,0.10);
  --amber: #f59e0b;
  --amber-dim: rgba(245,158,11,0.10);
  --r: 6px;
  --r2: 10px;
  --font: 'DM Sans', sans-serif;
  --mono: 'DM Mono', monospace;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.up-root {
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px 60px;
}

/* ── CONTAINER ── */
.up-wrap {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

/* ── HEADER ── */
.up-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.up-head-left { display: flex; align-items: center; gap: 14px; }
.up-head-icon {
  width: 38px; height: 38px;
  background: var(--accent-dim);
  border: 1px solid var(--accent-glow);
  border-radius: var(--r);
  display: grid; place-items: center;
  font-size: 17px;
}
.up-head-title { font-size: 16px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
.up-head-sub { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
.up-close {
  background: none; border: 1px solid var(--border);
  border-radius: var(--r); color: var(--text3); cursor: pointer;
  width: 32px; height: 32px; display: grid; place-items: center;
  font-size: 12px; transition: all 0.15s;
}
.up-close:hover { border-color: var(--red); color: var(--red); background: var(--red-dim); }

/* ── TABS ── */
.up-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  overflow-x: auto; padding: 0 24px;
  background: var(--surface);
}
.up-tabs::-webkit-scrollbar { display: none; }
.up-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  margin-bottom: -1px; padding: 13px 15px;
  font-family: var(--font); font-size: 11px; font-weight: 500;
  color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase;
  cursor: pointer; white-space: nowrap; transition: color 0.15s;
}
.up-tab:hover { color: var(--text2); }
.up-tab.on { color: var(--accent); border-bottom-color: var(--accent); }

/* ── BODY ── */
.up-body {
  padding: 26px 28px;
  flex: 1;
  overflow-y: auto;
}
.up-body::-webkit-scrollbar { width: 3px; }
.up-body::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

/* ── SECTION HEADER ── */
.up-section {
  display: flex; align-items: center; gap: 10px;
  margin: 22px 0 12px;
}
.up-section:first-child { margin-top: 0; }
.up-section-line { flex: 1; height: 1px; background: var(--border); }
.up-section-label {
  font-size: 9.5px; color: var(--text3); text-transform: uppercase;
  letter-spacing: 1.5px; white-space: nowrap; font-weight: 500;
}

/* ── CASCADE GRID ── */
.up-cascade {
  display: grid;
  gap: 12px;
  margin-bottom: 4px;
}
.up-field-label {
  font-size: 10px; color: var(--text3); text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 6px; font-weight: 500;
}

/* ── SELECT ── */
.up-sel {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--text);
  font-family: var(--font);
  font-size: 13px;
  padding: 9px 34px 9px 12px;
  outline: none; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='none' stroke='%235a6076' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.up-sel:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.up-sel:disabled { opacity: 0.3; cursor: not-allowed; }
.up-sel option { background: var(--surface2); }

/* ── INPUT ── */
.up-input {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--text);
  font-family: var(--font);
  font-size: 13px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.up-input::placeholder { color: var(--text3); }
.up-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.up-input:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── ADD ROW ── */
.up-add-row { display: flex; gap: 8px; margin-bottom: 16px; }

/* ── BUTTONS ── */
.up-btn {
  background: var(--accent);
  border: none; border-radius: var(--r);
  color: #fff; font-family: var(--font);
  font-weight: 600; font-size: 12px;
  letter-spacing: 0.2px; padding: 9px 18px;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.up-btn:hover { filter: brightness(1.12); }
.up-btn:active { transform: scale(0.97); }
.up-btn:disabled { background: var(--surface3); color: var(--text3); cursor: not-allowed; transform: none; filter: none; }

.up-btn-outline {
  background: none;
  border: 1px solid var(--border-hi);
  border-radius: var(--r);
  color: var(--text2); font-family: var(--font);
  font-weight: 500; font-size: 12px;
  padding: 9px 18px; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.up-btn-outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

.up-btn-del {
  background: none; border: 1px solid var(--border);
  border-radius: var(--r); color: var(--text3);
  font-family: var(--font); font-size: 11px; font-weight: 500;
  padding: 5px 12px; cursor: pointer; transition: all 0.15s;
}
.up-btn-del:hover { border-color: var(--red); color: var(--red); background: var(--red-dim); }

/* ── ITEM LIST ── */
.up-list { display: flex; flex-direction: column; gap: 5px; }

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.up-item {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--r); padding: 10px 14px;
  transition: border-color 0.15s;
  animation: fadeSlide 0.2s ease;
}
.up-item:hover { border-color: var(--border-hi); }
.up-item-name { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text); }
.up-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: 0.5; flex-shrink: 0; }

.up-empty {
  font-size: 12px; color: var(--text3); text-align: center;
  padding: 30px; border: 1px dashed var(--border);
  border-radius: var(--r);
}

/* ── UPLOAD ZONE ── */
.up-zone {
  position: relative; border: 2px dashed var(--border);
  border-radius: var(--r2); padding: 32px 20px; text-align: center;
  background: var(--surface2); cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 16px;
}
.up-zone.lit { border-color: var(--accent); background: var(--accent-dim); }
.up-zone input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.up-zone-icon { font-size: 28px; margin-bottom: 8px; }
.up-zone-main { font-size: 13px; color: var(--text); margin-bottom: 3px; font-weight: 500; }
.up-zone-hint { font-size: 11px; color: var(--text3); }
.up-zone-file { font-size: 11.5px; color: var(--accent); margin-top: 8px; word-break: break-all; font-family: var(--mono); }

.up-col-pills { display: flex; gap: 7px; margin-bottom: 4px; }
.up-col-pill {
  background: var(--surface3); border: 1px solid var(--border);
  border-radius: 4px; padding: 4px 11px;
  font-size: 10.5px; color: var(--text3);
  font-family: var(--mono);
}
.up-col-pill span { color: var(--accent); }

/* ── CONFLICT BANNER ── */
.up-conflict {
  background: var(--amber-dim);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: var(--r2);
  padding: 14px 16px 16px;
  margin-top: 14px;
  animation: fadeSlide 0.2s ease;
}
.up-conflict-title {
  font-size: 12.5px; font-weight: 600; color: var(--amber);
  margin-bottom: 4px; display: flex; align-items: center; gap: 7px;
}
.up-conflict-sub { font-size: 11.5px; color: var(--text2); margin-bottom: 12px; }
.up-conflict-actions { display: flex; gap: 8px; }
.up-btn-append {
  background: var(--accent); border: none; border-radius: var(--r);
  color: #fff; font-family: var(--font); font-weight: 600;
  font-size: 12px; padding: 9px 20px; cursor: pointer; transition: all 0.15s;
}
.up-btn-append:hover { filter: brightness(1.12); }
.up-btn-replace {
  background: none; border: 1px solid var(--red);
  border-radius: var(--r); color: var(--red);
  font-family: var(--font); font-weight: 600;
  font-size: 12px; padding: 9px 20px; cursor: pointer; transition: all 0.15s;
}
.up-btn-replace:hover { background: var(--red-dim); }

/* ── STATUS ── */
.up-status {
  display: flex; align-items: center; gap: 9px;
  font-size: 12px; padding: 10px 14px; border-radius: var(--r);
  margin-top: 12px; animation: fadeSlide 0.2s ease;
  font-weight: 500;
}
.up-status.ok  { background: var(--green-dim); border: 1px solid rgba(52,211,153,0.22); color: var(--green); }
.up-status.err { background: var(--red-dim);   border: 1px solid rgba(240,82,82,0.22);  color: var(--red); }
.up-status.ld  { background: var(--accent-dim); border: 1px solid var(--accent-glow);   color: var(--accent); }

/* ── FOOTER ── */
.up-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

/* ── STATS BADGE ── */
.up-stats {
  display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;
}
.up-stat {
  background: var(--surface3); border: 1px solid var(--border);
  border-radius: 4px; padding: 4px 10px;
  font-size: 10.5px; color: var(--text3);
}
.up-stat b { color: var(--text2); font-weight: 600; }

@keyframes spin { to { transform: rotate(360deg); } }
.up-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(91,141,238,0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
`;

/* ─────────────────────── HELPERS ─────────────────────── */
const CHUNK = 50;

async function insertChunked(table, rows) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(table).insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(error.message);
  }
}

function dedupeByKey(arr, key) {
  const seen = new Set();
  return arr.filter(r => {
    const k = (r[key] || "").trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ─────────────────────── COMPONENT ─────────────────────── */
export default function UploadPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upload");

  // Lookup data
  const [semesters, setSemesters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);

  // Selections
  const [selSem, setSelSem] = useState("");
  const [selBr, setSelBr] = useState("");
  const [selSub, setSelSub] = useState("");
  const [selMod, setSelMod] = useState("");

  // Manage tabs
  const [input, setInput] = useState("");

  // Upload tab
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | {type:"ok"|"err"|"ld", msg}
  const [conflictMode, setConflictMode] = useState(false); // show append/replace
  const [existingCount, setExistingCount] = useState(0);
  const [uploadStats, setUploadStats] = useState(null); // {inserted, skipped, total}
  const [parsedRows, setParsedRows] = useState(null); // rows parsed from excel, ready to insert

  /* inject CSS */
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  /* loaders */
  useEffect(() => { loadSemesters(); }, []);

  const loadSemesters = async () => {
    const { data, error } = await supabase.from("semesters").select("*").order("label");
    if (!error) setSemesters(data || []);
  };
  const loadBranches = async (sid) => {
    const { data, error } = await supabase.from("branches").select("*").eq("semester_id", sid).order("label");
    if (!error) { setBranches(data || []); setSubjects([]); setModules([]); }
  };
  const loadSubjects = async (bid) => {
    const { data, error } = await supabase.from("subjects").select("*").eq("branch_id", bid).order("label");
    if (!error) { setSubjects(data || []); setModules([]); }
  };
  const loadModules = async (sid) => {
    const { data, error } = await supabase.from("modules").select("*").eq("subject_id", sid).order("label");
    if (!error) setModules(data || []);
  };

  /* cascade handlers */
  const onSem = (v) => { setSelSem(v); setSelBr(""); setSelSub(""); setSelMod(""); resetUploadState(); v ? loadBranches(v) : (setBranches([]), setSubjects([]), setModules([])); };
  const onBr  = (v) => { setSelBr(v);  setSelSub(""); setSelMod(""); resetUploadState(); v ? loadSubjects(v) : (setSubjects([]), setModules([])); };
  const onSub = (v) => { setSelSub(v); setSelMod(""); resetUploadState(); v ? loadModules(v) : setModules([]); };
  const onMod = (v) => { setSelMod(v); resetUploadState(); };

  const resetUploadState = () => {
    setStatus(null);
    setConflictMode(false);
    setExistingCount(0);
    setUploadStats(null);
    setParsedRows(null);
  };

  /* parse excel and return clean rows */
  const parseExcel = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!raw.length) return reject(new Error("File is empty or unreadable."));
        const rows = raw
          .filter(r => r.Question && String(r.Question).trim())
          .map(r => ({
            sem_id: selSem, branch_id: selBr, subject_id: selSub, module_id: selMod,
            question: String(r.Question).trim(),
            answer: r.Answer != null ? String(r.Answer).trim() : "",
          }));
        if (!rows.length) return reject(new Error("No valid rows found. Ensure 'Question' column exists."));
        // Dedupe within the Excel file itself
        const deduped = dedupeByKey(rows, "question");
        resolve(deduped);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(f);
  });

  /* STEP 1: Initiate upload — parse file, check existing */
  const handleUploadInit = async () => {
    if (!file || !selMod || !selBr || !selSub || !selSem)
      return setStatus({ type: "err", msg: "Select Semester → Branch → Subject → Module and choose a file." });

    setStatus({ type: "ld", msg: "Parsing file…" });
    setConflictMode(false);
    setUploadStats(null);

    let rows;
    try {
      rows = await parseExcel(file);
    } catch (err) {
      return setStatus({ type: "err", msg: err.message });
    }

    setStatus({ type: "ld", msg: "Checking existing questions…" });

    const { data: existing, error: checkError } = await supabase
      .from("dt_questions")
      .select("id")
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (checkError) return setStatus({ type: "err", msg: checkError.message });

    setParsedRows(rows);

    if (existing.length === 0) {
      // No conflict — insert directly
      await doInsert(rows, "fresh");
    } else {
      // Conflict — show options
      setExistingCount(existing.length);
      setConflictMode(true);
      setStatus(null);
    }
  };

  /* STEP 2a: Append — filter out duplicates, insert only new */
  const handleAppend = async () => {
    if (!parsedRows) return;
    setConflictMode(false);
    setStatus({ type: "ld", msg: "Fetching existing questions to deduplicate…" });

    const { data: existing, error } = await supabase
      .from("dt_questions")
      .select("question")
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (error) return setStatus({ type: "err", msg: error.message });

    const existingSet = new Set(existing.map(r => r.question.trim().toLowerCase()));
    const newRows = parsedRows.filter(r => !existingSet.has(r.question.toLowerCase()));

    if (newRows.length === 0) {
      setUploadStats({ inserted: 0, skipped: parsedRows.length, total: parsedRows.length });
      setFile(null);
      setParsedRows(null);
      return setStatus({ type: "ok", msg: "No new questions to insert — all already exist." });
    }

    await doInsert(newRows, "append", parsedRows.length);
  };

  /* STEP 2b: Replace — delete all, insert fresh */
  const handleReplace = async () => {
    if (!parsedRows) return;
    setConflictMode(false);
    setStatus({ type: "ld", msg: "Deleting existing questions…" });

    const { error: delError } = await supabase
      .from("dt_questions")
      .delete()
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (delError) return setStatus({ type: "err", msg: delError.message });

    await doInsert(parsedRows, "replace");
  };

  /* Core insert logic */
  const doInsert = async (rows, mode, totalFromFile = null) => {
    const total = totalFromFile ?? rows.length;
    setStatus({ type: "ld", msg: `Uploading ${rows.length} question${rows.length !== 1 ? "s" : ""}…` });

    try {
      await insertChunked("dt_questions", rows);
      const skipped = mode === "append" ? total - rows.length : 0;
      setUploadStats({ inserted: rows.length, skipped, total });
      setStatus({ type: "ok", msg: `Uploaded successfully! ${rows.length} question${rows.length !== 1 ? "s" : ""} inserted.` });
      setFile(null);
      setParsedRows(null);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    }
  };

  /* Manage tabs: add item */
  const addItem = async () => {
    if (!input.trim()) return;
    let error;
    if (tab === "semesters") {
      ({ error } = await supabase.from("semesters").insert([{ label: input.trim() }]));
      if (!error) loadSemesters();
    }
    if (tab === "branches") {
      if (!selSem) return alert("Select semester first");
      ({ error } = await supabase.from("branches").insert([{ label: input.trim(), semester_id: selSem }]));
      if (!error) loadBranches(selSem);
    }
    if (tab === "subjects") {
      if (!selBr) return alert("Select branch first");
      ({ error } = await supabase.from("subjects").insert([{ label: input.trim(), branch_id: selBr, sem_id: selSem }]));
      if (!error) loadSubjects(selBr);
    }
    if (tab === "modules") {
      if (!selSub) return alert("Select subject first");
      ({ error } = await supabase.from("modules").insert([{ label: input.trim(), subject_id: selSub }]));
      if (!error) loadModules(selSub);
    }
    if (error) return alert(error.message);
    setInput("");
  };

  const deleteItem = async (table, id) => {
    if (!window.confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return alert(error.message);
    if (table === "semesters") loadSemesters();
    if (table === "branches") loadBranches(selSem);
    if (table === "subjects") loadSubjects(selBr);
    if (table === "modules") loadModules(selSub);
  };

  /* ── SUB-COMPONENTS ── */
  const SectionLabel = ({ label }) => (
    <div className="up-section">
      <div className="up-section-line" />
      <div className="up-section-label">{label}</div>
      <div className="up-section-line" />
    </div>
  );

  const Cascade = ({ depth }) => {
    const cfgs = [
      { label: "Semester", val: selSem, fn: onSem, opts: semesters.map(s => ({ v: s.id, l: s.label })) },
      { label: "Branch",   val: selBr,  fn: onBr,  opts: branches.map(b => ({ v: b.id, l: b.label })) },
      { label: "Subject",  val: selSub, fn: onSub, opts: subjects.map(s => ({ v: s.id, l: s.label })) },
      { label: "Module",   val: selMod, fn: onMod, opts: modules.map(m => ({ v: m.id, l: m.label })) },
    ];
    const depthMap = { semester: 1, branch: 2, subject: 3, module: 4 };
    const count = depthMap[depth] || 1;
    const cols = count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    return (
      <div className="up-cascade" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cfgs.slice(0, count).map((c, i) => (
          <div key={i}>
            <div className="up-field-label">{c.label}</div>
            <select className="up-sel" value={c.val} onChange={e => c.fn(e.target.value)}
              disabled={i > 0 && !cfgs[i - 1].val}>
              <option value="">— select —</option>
              {c.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}
      </div>
    );
  };

  const listCfg = {
    semesters: { items: semesters, table: "semesters", getLabel: s => s.label },
    branches:  { items: branches,  table: "branches",  getLabel: b => b.label },
    subjects:  { items: subjects,  table: "subjects",  getLabel: s => s.label },
    modules:   { items: modules,   table: "modules",   getLabel: m => m.label },
  }[tab];

  const addDisabled =
    (tab === "branches" && !selSem) ||
    (tab === "subjects" && !selBr) ||
    (tab === "modules" && !selSub);

  const placeholders = {
    semesters: "e.g. Semester 1",
    branches:  "e.g. CSE",
    subjects:  "e.g. Data Structures",
    modules:   "e.g. Module 1 — Arrays",
  };

  const canUpload = file && selMod && selBr && selSub && selSem && status?.type !== "ld";
  const TABS = ["semesters", "branches", "subjects", "modules", "upload"];

  return (
    <div className="up-root">
      <div className="up-wrap">

        {/* HEADER */}
        <div className="up-head">
          <div className="up-head-left">
            <div className="up-head-icon">⚙️</div>
            <div>
              <div className="up-head-title">Admin Dashboard</div>
              <div className="up-head-sub">Content Management</div>
            </div>
          </div>
          <button className="up-close" onClick={() => navigate(-1)}>✕</button>
        </div>

        {/* TABS */}
        <div className="up-tabs">
          {TABS.map(t => (
            <button key={t}
              className={`up-tab${tab === t ? " on" : ""}`}
              onClick={() => { setTab(t); setInput(""); resetUploadState(); }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="up-body">

          {/* MANAGE TABS */}
          {tab !== "upload" && listCfg && (<>
            {tab === "branches" && <><SectionLabel label="Select semester" /><Cascade depth="semester" /></>}
            {tab === "subjects" && <><SectionLabel label="Select parent" /><Cascade depth="branch" /></>}
            {tab === "modules"  && <><SectionLabel label="Select parent" /><Cascade depth="subject" /></>}

            <SectionLabel label={`Add ${tab.slice(0, -1)}`} />
            <div className="up-add-row">
              <input className="up-input"
                placeholder={placeholders[tab] || ""}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !addDisabled && addItem()}
                disabled={addDisabled} />
              <button className="up-btn" onClick={addItem}
                disabled={addDisabled || !input.trim()}>
                + Add
              </button>
            </div>

            <SectionLabel label={`${listCfg.items.length} ${tab}`} />
            <div className="up-list">
              {listCfg.items.map(item => (
                <div key={item.id} className="up-item">
                  <div className="up-item-name">
                    <div className="up-dot" />
                    {listCfg.getLabel(item)}
                  </div>
                  <button className="up-btn-del" onClick={() => deleteItem(listCfg.table, item.id)}>
                    Delete
                  </button>
                </div>
              ))}
              {listCfg.items.length === 0 && (
                <div className="up-empty">
                  {addDisabled
                    ? "Select a parent above to load entries."
                    : `No ${tab} yet — add one above.`}
                </div>
              )}
            </div>
          </>)}

          {/* UPLOAD TAB */}
          {tab === "upload" && (<>
            <SectionLabel label="Select target" />
            <Cascade depth="module" />

            <SectionLabel label="Upload file" />

            <div className={`up-zone${file ? " lit" : ""}`}>
              <input type="file" accept=".xlsx,.xls"
                onChange={e => {
                  setFile(e.target.files[0] || null);
                  setStatus(null);
                  setConflictMode(false);
                  setUploadStats(null);
                  setParsedRows(null);
                }} />
              <div className="up-zone-icon">{file ? "📄" : "📂"}</div>
              <div className="up-zone-main">{file ? "File selected" : "Click or drag an Excel file here"}</div>
              <div className="up-zone-hint">Accepts .xlsx · .xls</div>
              {file && <div className="up-zone-file">{file.name}</div>}
            </div>

            <div className="up-col-pills">
              <div className="up-col-pill">Column: <span>Question</span></div>
              <div className="up-col-pill">Column: <span>Answer</span></div>
            </div>

            {/* Stats row */}
            {uploadStats && (
              <div className="up-stats">
                <div className="up-stat">Total in file: <b>{uploadStats.total}</b></div>
                <div className="up-stat">Inserted: <b>{uploadStats.inserted}</b></div>
                {uploadStats.skipped > 0 && <div className="up-stat">Skipped (duplicates): <b>{uploadStats.skipped}</b></div>}
              </div>
            )}

            {/* Conflict banner */}
            {conflictMode && (
              <div className="up-conflict">
                <div className="up-conflict-title">⚠ Questions Already Exist</div>
                <div className="up-conflict-sub">
                  There are already <b>{existingCount}</b> question{existingCount !== 1 ? "s" : ""} for this scope. How would you like to proceed?
                  <br />
                  <b>Append</b> — insert only new questions (skips duplicates).&nbsp;
                  <b>Replace</b> — delete all existing and upload fresh.
                </div>
                <div className="up-conflict-actions">
                  <button className="up-btn-append" onClick={handleAppend}>
                    Append new only
                  </button>
                  <button className="up-btn-replace" onClick={handleReplace}>
                    Replace all
                  </button>
                  <button className="up-btn-outline" onClick={() => { setConflictMode(false); setStatus(null); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status message */}
            {status && (
              <div className={`up-status ${status.type}`}>
                {status.type === "ld" ? <div className="up-spinner" /> : <span>{status.type === "ok" ? "✓" : "✕"}</span>}
                <span>{status.msg}</span>
              </div>
            )}

            {/* Footer */}
            {!conflictMode && (
              <div className="up-footer">
                {file && status?.type !== "ld" && (
                  <button className="up-btn-outline" onClick={() => {
                    setFile(null); setStatus(null); setUploadStats(null); setParsedRows(null);
                  }}>
                    Clear
                  </button>
                )}
                <button className="up-btn" style={{ padding: "10px 24px", fontSize: "13px" }}
                  onClick={handleUploadInit}
                  disabled={!canUpload}>
                  {status?.type === "ld" ? "Uploading…" : "Upload Questions →"}
                </button>
              </div>
            )}
          </>)}

        </div>
      </div>
    </div>
  );
}