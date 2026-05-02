import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// ─── Schema reference ──────────────────────────────────────────────────────────
// exam_results : id, exam_id, st_id, total_marks, final_grade, avg_match_pct,
//                attempted_questions, total_questions, violations_count, submitted_at
// conduct_exam : exam_id, exam_name, sem_id, subject_id, start_time, end_time
// student      : st_id, st_name, sem_id, branch_id, section
// branches     : id, label, semester_id
// semesters    : id, label
// ─────────────────────────────────────────────────────────────────────────────
import * as XLSX from 'xlsx';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .er-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .er-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
    position: sticky; top: 0; z-index: 10;
  }
  .er-brand { display: flex; align-items: center; gap: 12px; }
  .er-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .er-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .er-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .er-nav-actions { display: flex; align-items: center; gap: 10px; }

  .er-back {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: #F0EDE6;
    border: 1px solid #E2DDD5;
    border-radius: 10px;
    color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .er-back:hover { background: #E8E4DC; }

  .er-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .er-logout:hover { background: rgba(239,68,68,0.12); }

  /* MAIN */
  .er-main {
    flex: 1;
    max-width: 1180px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 28px 60px;
  }

  /* HEADER */
  .er-header { margin-bottom: 32px; }
  .er-header-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .er-header-label::before { content: ''; width: 3px; height: 16px; background: #C97B2E; border-radius: 2px; }
  .er-header-label span { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #AAA; }
  .er-header h2 { font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400; color: #1A1A1A; line-height: 1.2; }
  .er-header h2 em { font-style: italic; color: #C97B2E; }
  .er-header p { font-size: 14px; color: #888; margin-top: 6px; }

  /* CARD */
  .er-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 16px;
    padding: 24px 24px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .er-card-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: #AAA; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .er-card-title::before { content: ''; width: 3px; height: 12px; background: #C97B2E; border-radius: 2px; }

  /* SEARCH ROW */
  .er-search-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .er-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .er-search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .er-search-input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .er-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #BBB; pointer-events: none;
  }
  .er-search-btn {
    padding: 12px 22px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(201,123,46,0.28);
    white-space: nowrap;
  }
  .er-search-btn:hover { background: #B56E25; transform: translateY(-1px); }

  /* DOWNLOAD BTN */
  .er-download-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #2E7D52, #3a9d67);
    color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(46,125,82,0.28);
    white-space: nowrap;
  }
  .er-download-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(46,125,82,0.36); }
  .er-download-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* FILTER PILLS */
  .er-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .er-filter-btn {
    padding: 8px 18px;
    background: #F0EDE6;
    border: 1.5px solid #E2DDD5;
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; color: #555;
    cursor: pointer; transition: all 0.2s;
  }
  .er-filter-btn:hover { border-color: #C97B2E; color: #C97B2E; background: #FFF8F0; }
  .er-filter-btn.active { background: #C97B2E; border-color: #C97B2E; color: #fff; }

  /* FILTER SELECTS */
  .er-select-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; align-items: center; }
  .er-select {
    padding: 9px 14px;
    border: 1.5px solid #E8E4DC;
    border-radius: 10px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #1A1A1A; outline: none;
    cursor: pointer; transition: border-color 0.2s;
    min-width: 160px;
  }
  .er-select:focus { border-color: #C97B2E; }
  .er-apply-btn {
    padding: 9px 18px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .er-apply-btn:hover { background: #B56E25; }

  /* TABLE */
  .er-table-wrap { overflow-x: auto; margin-top: 4px; }
  .er-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .er-table th {
    text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: #AAA; padding: 12px 14px;
    border-bottom: 1.5px solid #ECEAE4;
    background: #FAFAF7;
  }
  .er-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #F0EDE6;
    color: #333; vertical-align: middle;
  }
  .er-table tr:last-child td { border-bottom: none; }
  .er-table tr:hover td { background: #FFFDF9; }

  .er-roll-badge {
    display: inline-block;
    background: #FFF8F0;
    border: 1px solid rgba(201,123,46,0.2);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
    letter-spacing: 0.5px;
    font-family: monospace;
  }

  .er-exam-badge {
    display: inline-block;
    background: #F0F4FF;
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px; font-weight: 600; color: #4F46E5;
    letter-spacing: 0.5px;
    font-family: monospace;
  }

  .er-marks-high { color: #2E7D52; font-weight: 700; }
  .er-marks-mid  { color: #C97B2E; font-weight: 700; }
  .er-marks-low  { color: #C0392B; font-weight: 700; }

  /* STATUS / EMPTY */
  .er-loading { text-align: center; padding: 30px; color: #C97B2E; font-size: 14px; }
  .er-empty { text-align: center; padding: 40px 20px; color: #AAA; font-size: 15px; }
  .er-empty-icon { font-size: 36px; margin-bottom: 10px; }

  .er-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FFF8F0; border: 1px solid rgba(201,123,46,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
  }

  /* TOAST */
  .er-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999; transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .er-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .er-toast.success { background: #2E7D52; }
  .er-toast.error   { background: #C0392B; }

  /* ACTIVE FILTER SUMMARY */
  .er-filter-summary {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #888; margin-top: 10px; flex-wrap: wrap;
  }
  .er-filter-tag {
    background: #FFF8F0; border: 1px solid rgba(201,123,46,0.25);
    border-radius: 6px; padding: 3px 10px;
    font-size: 11px; font-weight: 600; color: #C97B2E;
  }
`;

// ─── Static lookup data ────────────────────────────────────────────────────────
const SEMESTERS = [
  { id: 1, label: "Semester 1" }, { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" }, { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" }, { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" }, { id: 8, label: "Semester 8" },
];

const BRANCHES_STATIC = [
  { id: 1, label: "CSE" }, { id: 2, label: "ECE" },
  { id: 3, label: "EEE" }, { id: 4, label: "MECH" },
  { id: 5, label: "CIVIL" }, { id: 6, label: "IT" },
  { id: 7, label: "AIDS" }, { id: 8, label: "AIML" },
];

const semLabel = id => SEMESTERS.find(s => s.id === Number(id))?.label ?? `Sem ${id}`;
const branchLabel = (id, allBranches) =>
  allBranches.find(b => b.id === Number(id))?.label ??
  BRANCHES_STATIC.find(b => b.id === Number(id))?.label ?? String(id);

// ─── Marks colour helper ───────────────────────────────────────────────────────
function marksClass(marks) {
  if (marks == null) return "";
  if (marks >= 4) return "er-marks-high";
  if (marks >= 2) return "er-marks-mid";
  return "er-marks-low";
}

// ─── Excel download (pure JS — no external library needed) ────────────────────
function buildExcelFilename(filterMode, filterSem, filterBranch, allBranches) {
  const ts = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const parts = ["Exam_Results"];

  if (filterMode === "sem" && filterSem) {
    const sl = semLabel(filterSem).replace(/\s+/g, "_");
    parts.push(sl);
    return `${parts.join("_")}_${ts}.csv`;
  }
  if (filterMode === "branch" && filterSem && filterBranch) {
    const sl = semLabel(filterSem).replace(/\s+/g, "_");
    const bl = branchLabel(filterBranch, allBranches);
    parts.push(sl, bl);
    return `${parts.join("_")}_${ts}.csv`;
  }
  if (filterMode === "exam" && filterBranch) {
    // reusing filterBranch field for exam_id in exam mode
    parts.push("By_Exam", `ExamID_${filterBranch}`);
    return `${parts.join("_")}_${ts}.csv`;
  }
  return `Exam_Results_All_${ts}.csv`;
}

function downloadExcel(results, allBranches) {
  const data = results.map(r => ({
  "Exam ID": r.exam_id ?? "—",
  "Exam Name": r.exam?.exam_name ?? "—",
  "Roll Number": r.st_id ?? "—",
  "Student Name": r.student?.st_name ?? "—",
  "Semester": semLabel(r.student?.sem_id),
  "Branch": r.student?.branch?.label ?? "—",
  "Section": r.student?.section ?? "—",
  "Subject": r.exam?.subject?.label ?? "—",   // ✅ ADD THIS
  "Marks (/5)": r.total_marks ?? "—",
}));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, "Exam_Results.xlsx");
}


// ─── Component ────────────────────────────────────────────────────────────────
export default function ExamResults() {
  const navigate = useNavigate();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchRoll, setSearchRoll] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | sem | branch | exam
  const [filterSem, setFilterSem] = useState("");
  const [filterBranch, setFilterBranch] = useState(""); // branch_id OR used for exam_id in exam mode
  const [filterExamId, setFilterExamId] = useState(""); // exam filter in "exam" mode

  // ── Data state ─────────────────────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]); // for exam dropdown
  const [allBranches, setAllBranches] = useState([]);
  const [filterBranches, setFilterBranches] = useState([]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  // ── Load exams for dropdown ────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("conduct_exam")
      .select("exam_id, exam_name, sem_id")
      .order("exam_id", { ascending: false })
      .then(({ data }) => setExams(data || []));
  }, []);

  // ── Load branches for filter dropdown when sem changes ─────────────────────
  useEffect(() => {
    if (!filterSem) { setFilterBranches([]); setFilterBranch(""); return; }
    supabase
      .from("branches")
      .select("id, label")
      .eq("semester_id", Number(filterSem))
      .order("label")
      .then(({ data }) => {
        const list = data || [];
        setFilterBranches(list);
        setFilterBranch("");
        setAllBranches(prev => {
          const ids = new Set(prev.map(b => b.id));
          return [...prev, ...list.filter(b => !ids.has(b.id))];
        });
      });
  }, [filterSem]); // eslint-disable-line

  // ── Fetch results ──────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (mode = filterMode) => {
    setLoading(true);

    // Base query — join student info + exam info
    let q = supabase
      .from("exam_results")
      .select(`
  id,
  exam_id,
  st_id,
  total_marks,
  final_grade,
  avg_match_pct,
  attempted_questions,
  total_questions,
  submitted_at,

  student:st_id (
    st_id,
    st_name,
    sem_id,
    branch_id,
    section,
    branch:branch_id (
      id,
      label
    )
  ),

  exam:exam_id (
    exam_id,
    exam_name,
    sem_id,
    subject_id,
    subject:subject_id (
      id,
      label
    )
  )
`)
      .order("submitted_at", { ascending: false });

    // Filters
    if (mode === "sem" && filterSem) {
      // Filter by exam.sem_id — we do it post-fetch since it's a join
    }
    if (mode === "branch" && filterSem && filterBranch) {
      // same — post-filter
    }
    if (mode === "exam" && filterExamId) {
      q = q.eq("exam_id", Number(filterExamId));
    }
    if (searchRoll.trim()) {
      q = q.ilike("st_id", `%${searchRoll.trim()}%`);
    }

    const { data, error } = await q.limit(500);
    setLoading(false);

    if (error) { showToast("Failed to fetch results", "error"); return; }

    let rows = data || [];

    // Post-fetch filters for sem/branch (since they're on the joined student row)
    if (mode === "sem" && filterSem) {
      rows = rows.filter(r => r.student?.sem_id === Number(filterSem));
    }
    if (mode === "branch" && filterSem) {
      rows = rows.filter(r => r.student?.sem_id === Number(filterSem));
      if (filterBranch) rows = rows.filter(r => r.student?.branch_id === Number(filterBranch));
    }

    // Accumulate branch labels for resolution
    rows.forEach(r => {
      if (r.student?.branch_id) {
        setAllBranches(prev => {
          if (prev.find(b => b.id === r.student.branch_id)) return prev;
          return prev; // will resolve via static BRANCHES_STATIC
        });
      }
    });

    setResults(rows);
  }, [filterMode, filterSem, filterBranch, filterExamId, searchRoll]); // eslint-disable-line

  // Load all on mount
  useEffect(() => { fetchResults("all"); }, []); // eslint-disable-line

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = () => fetchResults(filterMode);

  // ── Filter mode switch ─────────────────────────────────────────────────────
  const handleFilterMode = (mode) => {
    setFilterMode(mode);
    setSearchRoll("");
    setFilterSem(""); setFilterBranch(""); setFilterExamId("");
    if (mode === "all") fetchResults("all");
  };

  // ── Download Excel ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (results.length === 0) {
      showToast("No data to download", "error");
      return;
    }

    downloadExcel(results, allBranches);
    showToast("✅ Excel downloaded");
  };
  // ─── Active filter summary label ───────────────────────────────────────────
  const filterSummary = () => {
    const tags = [];
    if (filterMode !== "all") tags.push(filterMode.toUpperCase());
    if (filterSem) tags.push(semLabel(filterSem));
    if (filterBranch && filterMode === "branch") tags.push(branchLabel(filterBranch, allBranches));
    if (filterExamId && filterMode === "exam") {
      const ex = exams.find(e => e.exam_id === Number(filterExamId));
      tags.push(`Exam: ${ex?.exam_name ?? filterExamId}`);
    }
    return tags;
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="er-wrapper">

        {/* ── NAVBAR ── */}
        <nav className="er-nav">
          <div className="er-brand">
            <div className="er-logo">DT</div>
            <div className="er-brand-text">
              <h1>Exam Results</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="er-nav-actions">
            <button className="er-back" onClick={() => navigate("/admin-dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Dashboard
            </button>
            <button className="er-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        <main className="er-main">

          {/* ── PAGE HEADER ── */}
          <div className="er-header">
            <div className="er-header-label"><span>Admin · Exam Results</span></div>
            <h2>Student Exam <em>Results</em></h2>
            <p>Filter results by semester, branch, or exam — then download the filtered data as Excel.</p>
          </div>

          {/* ── SEARCH + FILTER CARD ── */}
          <div className="er-card">
            <div className="er-card-title">Search & Filter</div>

            {/* Search row */}
            <div className="er-search-row">
              <div className="er-search-wrap">
                <svg className="er-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="er-search-input"
                  type="text"
                  placeholder="Search by roll number…"
                  value={searchRoll}
                  onChange={e => setSearchRoll(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="er-search-btn" onClick={handleSearch}>🔍 Search</button>
              <button
                className="er-download-btn"
                onClick={handleDownload}
                disabled={results.length === 0}
                title={results.length === 0 ? "No data to download" : `Download ${results.length} records as Excel`}
              >
                📥 Download Excel
              </button>
            </div>

            {/* Filter mode pills */}
            <div className="er-filters">
              {[
                { key: "all", label: "All Results" },
                { key: "sem", label: "By Semester" },
                { key: "branch", label: "By Branch" },
                { key: "exam", label: "By Exam" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`er-filter-btn ${filterMode === key ? "active" : ""}`}
                  onClick={() => handleFilterMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cascade selects */}
            {filterMode !== "all" && (
              <div className="er-select-row">
                {/* Semester — shown for sem and branch modes */}
                {(filterMode === "sem" || filterMode === "branch") && (
                  <select className="er-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                    <option value="">All Semesters</option>
                    {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                )}

                {/* Branch — shown only for branch mode */}
                {filterMode === "branch" && (
                  <select
                    className="er-select"
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                    disabled={!filterSem}
                  >
                    <option value="">{filterSem ? "All Branches" : "Select semester first"}</option>
                    {filterBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                )}

                {/* Exam ID — shown only for exam mode */}
                {filterMode === "exam" && (
                  <select className="er-select" value={filterExamId} onChange={e => setFilterExamId(e.target.value)}>
                    <option value="">All Exams</option>
                    {exams.map(e => (
                      <option key={e.exam_id} value={e.exam_id}>
                        #{e.exam_id} — {e.exam_name}
                      </option>
                    ))}
                  </select>
                )}

                <button className="er-apply-btn" onClick={() => fetchResults(filterMode)}>
                  Apply Filter
                </button>
              </div>
            )}

            {/* Active filter tags */}
            {filterSummary().length > 0 && (
              <div className="er-filter-summary">
                <span>Active filters:</span>
                {filterSummary().map((t, i) => <span key={i} className="er-filter-tag">{t}</span>)}
                <span style={{ color: "#C97B2E", fontWeight: 600 }}>
                  → {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── RESULTS TABLE CARD ── */}
          <div className="er-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="er-card-title" style={{ margin: 0 }}>Result Records</div>
              {results.length > 0 && (
                <span className="er-count-badge">
                  📊 {results.length} record{results.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="er-loading">⏳ Loading results…</div>
            ) : results.length === 0 ? (
              <div className="er-empty">
                <div className="er-empty-icon">📭</div>
                <div>No results found. Try adjusting your filters.</div>
              </div>
            ) : (
              <div className="er-table-wrap">
                <table className="er-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Exam ID</th>
                      <th>Exam Name</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Semester</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Subject</th>
                      <th>Marks (/5)</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const sem = r.student?.sem_id ? semLabel(r.student.sem_id) : "—";
                      const bran = r.student?.branch?.label ?? "—";
                      const sec = r.student?.section ? String(r.student.section) : "—";
                      const sub = r.submitted_at
                        ? new Date(r.submitted_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
                        : "—";
                        const subject = r.exam?.subject?.label ?? "—";
                      return (
                        <tr key={r.id}>
                          <td style={{ color: "#CCC", fontSize: 12 }}>{idx + 1}</td>
                          <td><span className="er-exam-badge">#{r.exam_id}</span></td>
                          <td style={{ fontWeight: 500, maxWidth: 200 }}>{r.exam?.exam_name ?? "—"}</td>
                          <td><span className="er-roll-badge">{r.st_id}</span></td>
                          <td style={{ fontWeight: 500 }}>{r.student?.st_name ?? "—"}</td>
                          <td>{sem}</td>
                          <td>{bran}</td>
                          <td>{sec}</td>
                          <td>{subject}</td>
                          <td>
                            <span className={marksClass(r.total_marks)}>
                              {r.total_marks ?? "—"}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: "#888" }}>{sub}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── TOAST ── */}
      <div className={`er-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}
