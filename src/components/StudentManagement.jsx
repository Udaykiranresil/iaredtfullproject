import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// ─── Schema (from Supabase screenshot) ────────────────────────────────────────
// student  : st_id (text PK), st_name (varchar), sem_id (int4), branch_id (int4), section (int4), password (text)
// branches : id (int4 PK), label (text), semester_id (int4)
// semesters: id (int4 PK), label (text)
// ─────────────────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sm-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .sm-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
    position: sticky; top: 0; z-index: 10;
  }
  .sm-brand { display: flex; align-items: center; gap: 12px; }
  .sm-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .sm-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .sm-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .sm-nav-actions { display: flex; align-items: center; gap: 10px; }

  .sm-back {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: #F0EDE6;
    border: 1px solid #E2DDD5;
    border-radius: 10px;
    color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .sm-back:hover { background: #E8E4DC; }

  .sm-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .sm-logout:hover { background: rgba(239,68,68,0.12); }

  /* MAIN */
  .sm-main {
    flex: 1;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 28px 60px;
  }

  /* HEADER */
  .sm-header { margin-bottom: 32px; }
  .sm-header-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .sm-header-label::before { content: ''; width: 3px; height: 16px; background: #C97B2E; border-radius: 2px; }
  .sm-header-label span { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #AAA; }
  .sm-header h2 { font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400; color: #1A1A1A; line-height: 1.2; }
  .sm-header h2 em { font-style: italic; color: #C97B2E; }
  .sm-header p { font-size: 14px; color: #888; margin-top: 6px; }

  /* CARD */
  .sm-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 16px;
    padding: 24px 24px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .sm-card-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: #AAA; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .sm-card-title::before { content: ''; width: 3px; height: 12px; background: #C97B2E; border-radius: 2px; }

  /* SEARCH ROW */
  .sm-search-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .sm-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .sm-search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sm-search-input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .sm-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #BBB; pointer-events: none;
  }
  .sm-search-btn {
    padding: 12px 22px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(201,123,46,0.28);
    white-space: nowrap;
  }
  .sm-search-btn:hover { background: #B56E25; transform: translateY(-1px); }

  /* ADD BTN */
  .sm-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #C97B2E, #e8a030);
    color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(201,123,46,0.28);
    white-space: nowrap;
  }
  .sm-add-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,123,46,0.36); }

  /* FILTER BUTTONS */
  .sm-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .sm-filter-btn {
    padding: 8px 18px;
    background: #F0EDE6;
    border: 1.5px solid #E2DDD5;
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; color: #555;
    cursor: pointer; transition: all 0.2s;
  }
  .sm-filter-btn:hover { border-color: #C97B2E; color: #C97B2E; background: #FFF8F0; }
  .sm-filter-btn.active { background: #C97B2E; border-color: #C97B2E; color: #fff; }

  /* FILTER SELECTS */
  .sm-select-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; align-items: center; }
  .sm-select {
    padding: 9px 14px;
    border: 1.5px solid #E8E4DC;
    border-radius: 10px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #1A1A1A; outline: none;
    cursor: pointer; transition: border-color 0.2s;
    min-width: 150px;
  }
  .sm-select:focus { border-color: #C97B2E; }
  .sm-apply-btn {
    padding: 9px 18px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .sm-apply-btn:hover { background: #B56E25; }

  /* TABLE */
  .sm-table-wrap { overflow-x: auto; margin-top: 4px; }
  .sm-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .sm-table th {
    text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: #AAA; padding: 12px 14px;
    border-bottom: 1.5px solid #ECEAE4;
    background: #FAFAF7;
  }
  .sm-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #F0EDE6;
    color: #333; vertical-align: middle;
  }
  .sm-table tr:last-child td { border-bottom: none; }
  .sm-table tr:hover td { background: #FFFDF9; }

  .sm-roll-badge {
    display: inline-block;
    background: #FFF8F0;
    border: 1px solid rgba(201,123,46,0.2);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
    letter-spacing: 0.5px;
    font-family: monospace;
  }

  .sm-edit-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1.5px solid #C97B2E;
    border-radius: 8px;
    color: #C97B2E;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .sm-edit-btn:hover { background: #C97B2E; color: #fff; }

  .sm-delete-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1.5px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    margin-left: 6px;
  }
  .sm-delete-btn:hover { background: #ef4444; color: #fff; }

  .sm-action-group { display: flex; align-items: center; gap: 6px; }

  /* STATUS / EMPTY */
  .sm-loading { text-align: center; padding: 30px; color: #C97B2E; font-size: 14px; }
  .sm-empty { text-align: center; padding: 40px 20px; color: #AAA; font-size: 15px; }
  .sm-empty-icon { font-size: 36px; margin-bottom: 10px; }

  .sm-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FFF8F0; border: 1px solid rgba(201,123,46,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
  }

  /* MODAL */
  .sm-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .sm-modal {
    background: #FAFAF7;
    border-radius: 18px;
    padding: 32px;
    width: 100%; max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid #ECEAE4;
    animation: sm-modal-in 0.25s cubic-bezier(0.22,1,0.36,1);
  }
  @keyframes sm-modal-in {
    from { opacity: 0; transform: scale(0.93) translateY(12px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
  }
  .sm-modal-header {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px;
  }
  .sm-modal-title { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; color: #1A1A1A; }
  .sm-modal-title em { font-style: italic; color: #C97B2E; }
  .sm-modal-subtitle { font-size: 12px; color: #AAA; margin-top: 4px; }
  .sm-modal-close {
    background: none; border: none; cursor: pointer; color: #AAA; padding: 4px;
    border-radius: 6px; transition: color 0.2s; display: flex; align-items: center;
  }
  .sm-modal-close:hover { color: #555; }

  .sm-form-group { margin-bottom: 16px; }
  .sm-form-group label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 0.8px; text-transform: uppercase;
    color: #666; margin-bottom: 7px;
  }
  .sm-form-group input, .sm-form-group select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #E8E4DC;
    border-radius: 10px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sm-form-group input:focus, .sm-form-group select:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .sm-form-group input:disabled { background: #F0EDE6; color: #AAA; cursor: not-allowed; }
  .sm-form-note { font-size: 11px; color: #BBB; margin-top: 4px; }

  .sm-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .sm-btn-save {
    flex: 1; padding: 13px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(201,123,46,0.28);
  }
  .sm-btn-save:hover:not(:disabled) { background: #B56E25; }
  .sm-btn-save:disabled { opacity: 0.7; cursor: wait; }
  .sm-btn-cancel {
    padding: 13px 20px;
    background: #F0EDE6; color: #555;
    border: 1px solid #E2DDD5; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .sm-btn-cancel:hover { background: #E8E4DC; }

  /* TOAST */
  .sm-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999; transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .sm-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .sm-toast.success { background: #2E7D52; }
  .sm-toast.error   { background: #C0392B; }

  /* CONFIRM DIALOG */
  .sm-confirm-box {
    background: #fff; border-radius: 14px; padding: 28px;
    width: 100%; max-width: 360px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid #ECEAE4;
    animation: sm-modal-in 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .sm-confirm-box h3 { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1A1A1A; margin-bottom: 8px; }
  .sm-confirm-box p  { font-size: 13px; color: #777; margin-bottom: 20px; }
  .sm-confirm-actions { display: flex; gap: 10px; }
  .sm-btn-danger {
    flex: 1; padding: 11px;
    background: #ef4444; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .sm-btn-danger:hover { background: #dc2626; }
`;

// ─── Static lookup data (must match Supabase branch/semester IDs) ─────────────
const SEMESTERS = [
  { id: 1, label: "Semester 1" }, { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" }, { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" }, { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" }, { id: 8, label: "Semester 8" },
];

const BRANCHES = [
  { id: 1, label: "CSE"  },
  { id: 2, label: "ECE"  },
  { id: 3, label: "EEE"  },
  { id: 4, label: "MECH" },
  { id: 5, label: "CIVIL"},
  { id: 6, label: "IT"   },
  { id: 7, label: "AIDS" },
  { id: 8, label: "AIML" },
];

const SECTIONS = [
  { id: 1, label: "A" }, { id: 2, label: "B" },
  { id: 3, label: "C" }, { id: 4, label: "D" },
  { id: 5, label: "E" }, { id: 6, label: "F" },
  { id: 7, label: "G" }, { id: 8, label: "H" },
];

// ─── Helper: get label from id ─────────────────────────────────────────────────
// branchLabel is dynamic — computed inside the component using live DB branches
const semLabel    = id => SEMESTERS.find(s => s.id === Number(id))?.label ?? `Sem ${id}`;
const sectionLabel= id => SECTIONS.find(s => s.id === Number(id))?.label ?? String(id);

// ─── Blank form shapes ────────────────────────────────────────────────────────
const blankAdd  = { st_id: "", st_name: "", sem_id: "", branch_id: "", section: "", password: "" };
const blankEdit = {         st_name: "", sem_id: "", branch_id: "", section: "", password: "" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentManagement() {
  const navigate = useNavigate();

  // ── Search & filter state ──────────────────────────────────────────────────
  const [searchRoll, setSearchRoll] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | sem | branch | section
  const [filterSem,     setFilterSem]     = useState("");
  const [filterBranch,  setFilterBranch]  = useState("");
  const [filterSection, setFilterSection] = useState("");

  // ── Data state ─────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [editModal,   setEditModal]   = useState(null);   // student object | null
  const [editForm,    setEditForm]    = useState(blankEdit);
  const [addModal,    setAddModal]    = useState(false);
  const [addForm,     setAddForm]     = useState(blankAdd);
  const [deleteTarget, setDeleteTarget] = useState(null); // student object | null
  const [saving,      setSaving]      = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  // ── Dynamic branches fetched from Supabase per semester ────────────────────
  // Separate lists for Add modal, Edit modal, and filter dropdown
  const [addBranches,    setAddBranches]    = useState([]);
  const [editBranches,   setEditBranches]   = useState([]);
  const [filterBranches, setFilterBranches] = useState([]);
  // All branches ever loaded — used to resolve branch labels in the table
  const [allBranches,    setAllBranches]    = useState([]);

  // Fetch branches for a given semester_id from the DB
  const fetchBranchesFor = async (semId) => {
    if (!semId) return [];
    const { data, error } = await supabase
      .from("branches")
      .select("id, label")
      .eq("semester_id", Number(semId))
      .order("label");
    if (error) { showToast("Failed to load branches", "error"); return []; }
    return data || [];
  };

  // When add-form semester changes → reload add branches
  useEffect(() => {
    if (!addForm.sem_id) { setAddBranches([]); return; }
    fetchBranchesFor(addForm.sem_id).then(list => {
      setAddBranches(list);
      // If previously selected branch is no longer valid, clear it
      setAddForm(f => ({ ...f, branch_id: "" }));
      // Merge into allBranches for table label resolution
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [addForm.sem_id]); // eslint-disable-line

  // When edit-form semester changes → reload edit branches
  // We track whether modal was just opened to avoid clearing branch_id on initial load
  const editModalOpenRef = useState({ justOpened: false })[0];
  useEffect(() => {
    if (!editForm.sem_id) { setEditBranches([]); return; }
    fetchBranchesFor(editForm.sem_id).then(list => {
      setEditBranches(list);
      // Only clear branch_id if user manually changed the semester (not on initial open)
      if (!editModalOpenRef.justOpened) {
        setEditForm(f => ({ ...f, branch_id: "" }));
      }
      editModalOpenRef.justOpened = false;
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [editForm.sem_id]); // eslint-disable-line

  // When filter semester changes → reload filter branches
  useEffect(() => {
    if (!filterSem) { setFilterBranches([]); return; }
    fetchBranchesFor(filterSem).then(list => {
      setFilterBranches(list);
      setFilterBranch("");
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [filterSem]); // eslint-disable-line

  // Resolve branch label by id using the accumulated allBranches list
  const branchLabel = (id) =>
    allBranches.find(b => b.id === Number(id))?.label ?? BRANCHES.find(b => b.id === Number(id))?.label ?? String(id);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (mode = filterMode) => {
    setLoading(true);
    let q = supabase.from("student").select("*");

    if (mode === "sem") {
      if (filterSem) q = q.eq("sem_id", Number(filterSem));
    } else if (mode === "branch") {
      if (filterSem)    q = q.eq("sem_id",    Number(filterSem));
      if (filterBranch) q = q.eq("branch_id", Number(filterBranch));
    } else if (mode === "section") {
      if (filterSem)     q = q.eq("sem_id",    Number(filterSem));
      if (filterBranch)  q = q.eq("branch_id", Number(filterBranch));
      if (filterSection) q = q.eq("section",   Number(filterSection));
    }

    const { data, error } = await q.order("st_id");
    setLoading(false);
    if (error) { showToast("Failed to fetch students", "error"); return; }
    setStudents(data || []);
  }, [filterMode, filterSem, filterBranch, filterSection]);

  // Load all on mount
  useEffect(() => { fetchStudents("all"); }, []); // eslint-disable-line

  // ── Search by roll number ──────────────────────────────────────────────────
  const handleSearch = async () => {
    const term = searchRoll.trim();
    if (!term) { fetchStudents(); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("student").select("*")
      .ilike("st_id", `%${term}%`);
    setLoading(false);
    if (error) { showToast("Search failed", "error"); return; }
    setStudents(data || []);
  };

  // ── Filter mode switch ─────────────────────────────────────────────────────
  const handleFilterMode = (mode) => {
    setFilterMode(mode);
    setSearchRoll("");
    if (mode === "all")    { setFilterSem(""); setFilterBranch(""); setFilterSection(""); fetchStudents("all"); }
    if (mode === "sem")    { setFilterBranch(""); setFilterSection(""); }
    if (mode === "branch") { setFilterSection(""); }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = async (s) => {
    editModalOpenRef.justOpened = true; // signal: don't clear branch_id on first sem_id effect
    setEditModal(String(s.st_id));
    setEditForm({
      st_name:   typeof s.st_name   === "string" ? s.st_name   : "",
      sem_id:    s.sem_id    != null ? String(s.sem_id)    : "",
      branch_id: s.branch_id != null ? String(s.branch_id) : "",
      section:   s.section   != null ? String(s.section)   : "",
      password:  typeof s.password  === "string" ? s.password  : "",
    });
    // Pre-load branches for this student's semester so the select is populated
    if (s.sem_id) {
      const list = await fetchBranchesFor(s.sem_id);
      setEditBranches(list);
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    }
  };

  const saveEdit = async () => {
    if (!editForm.st_name.trim()) { showToast("Name is required", "error"); return; }
    if (!editForm.sem_id)         { showToast("Please select a semester", "error"); return; }
    if (!editForm.branch_id)      { showToast("Please select a branch", "error"); return; }
    if (!editForm.section)        { showToast("Please select a section", "error"); return; }
    if (!editForm.password.trim()){ showToast("Password is required", "error"); return; }

    setSaving(true);
    const { error } = await supabase
      .from("student")
      .update({
        st_name:   editForm.st_name.trim(),
        sem_id:    Number(editForm.sem_id),
        branch_id: Number(editForm.branch_id),
        section:   Number(editForm.section),
        password:  editForm.password.trim(),
      })
      .eq("st_id", editModal);   // editModal is now the plain st_id string
    setSaving(false);

    if (error) { showToast("Failed to update student: " + error.message, "error"); return; }
    showToast("✅ Student updated successfully");
    setEditModal(null);
    fetchStudents();
  };

  // ── Add handlers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm({
      ...blankAdd,
      sem_id:    filterSem     || "",
      branch_id: filterBranch  || "",
      section:   filterSection || "",
    });
    setAddModal(true);
  };

  const saveAdd = async () => {
    const { st_id, st_name, sem_id, branch_id, section, password } = addForm;
    if (!st_id.trim())    { showToast("Roll number is required", "error"); return; }
    if (!st_name.trim())  { showToast("Name is required", "error"); return; }
    if (!sem_id)          { showToast("Please select a semester", "error"); return; }
    if (!branch_id)       { showToast("Please select a branch", "error"); return; }
    if (!section)         { showToast("Please select a section", "error"); return; }
    if (!password.trim()) { showToast("Password is required", "error"); return; }

    setSaving(true);
    const { error } = await supabase.from("student").insert({
      st_id:     st_id.trim().toUpperCase(),
      st_name:   st_name.trim(),
      sem_id:    Number(sem_id),
      branch_id: Number(branch_id),
      section:   Number(section),
      password:  password.trim(),
    });
    setSaving(false);

    if (error) {
      if (error.code === "23505") showToast("Roll number already exists", "error");
      else showToast("Failed to add student: " + error.message, "error");
      return;
    }
    showToast("✅ Student added successfully");
    setAddModal(false);
    fetchStudents();
  };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const { error } = await supabase
      .from("student")
      .delete()
      .eq("st_id", deleteTarget.st_id);
    setSaving(false);
    if (error) { showToast("Failed to delete student", "error"); return; }
    showToast("🗑️ Student removed");
    setDeleteTarget(null);
    fetchStudents();
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="sm-wrapper">

        {/* ── NAVBAR ── */}
        <nav className="sm-nav">
          <div className="sm-brand">
            <div className="sm-logo">DT</div>
            <div className="sm-brand-text">
              <h1>Student Management</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="sm-nav-actions">
            <button className="sm-back" onClick={() => navigate("/admin-dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Dashboard
            </button>
            <button className="sm-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        <main className="sm-main">

          {/* ── PAGE HEADER ── */}
          <div className="sm-header">
            <div className="sm-header-label"><span>Admin · Student Management</span></div>
            <h2>Manage <em>Students</em></h2>
            <p>Search by roll number, filter by semester / branch / section, edit or add students.</p>
          </div>

          {/* ── SEARCH + FILTER CARD ── */}
          <div className="sm-card">
            <div className="sm-card-title">Search & Filter</div>

            {/* Search row */}
            <div className="sm-search-row">
              <div className="sm-search-wrap">
                <svg className="sm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="sm-search-input"
                  type="text"
                  placeholder="Search by roll number…"
                  value={searchRoll}
                  onChange={e => setSearchRoll(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="sm-search-btn" onClick={handleSearch}>🔍 Search</button>
              <button className="sm-add-btn"    onClick={openAdd}>➕ Add Student</button>
            </div>

            {/* Filter mode pills */}
            <div className="sm-filters">
              {[
                { key: "all",     label: "All Students"  },
                { key: "sem",     label: "By Semester"   },
                { key: "branch",  label: "By Branch"     },
                { key: "section", label: "By Section"    },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`sm-filter-btn ${filterMode === key ? "active" : ""}`}
                  onClick={() => handleFilterMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cascade selects */}
            {filterMode !== "all" && (
              <div className="sm-select-row">
                {/* Semester always shown when not "all" */}
                <select className="sm-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                  <option value="">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Branch shown for branch / section mode */}
                {(filterMode === "branch" || filterMode === "section") && (
                  <select className="sm-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterSem}>
                    <option value="">{filterSem ? "All Branches" : "Select semester first"}</option>
                    {filterBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                )}

                {/* Section shown only for section mode */}
                {filterMode === "section" && (
                  <select className="sm-select" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                    <option value="">All Sections</option>
                    {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                )}

                <button className="sm-apply-btn" onClick={() => fetchStudents(filterMode)}>
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* ── STUDENT TABLE CARD ── */}
          <div className="sm-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="sm-card-title" style={{ margin: 0 }}>Student Records</div>
              {students.length > 0 && (
                <span className="sm-count-badge">
                  👥 {students.length} student{students.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="sm-loading">⏳ Loading students…</div>
            ) : students.length === 0 ? (
              <div className="sm-empty">
                <div className="sm-empty-icon">📭</div>
                <div>No students found. Try adjusting your search or filters.</div>
              </div>
            ) : (
              <div className="sm-table-wrap">
                <table className="sm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Semester</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.st_id}>
                        <td style={{ color: "#CCC", fontSize: 12 }}>{idx + 1}</td>
                        <td><span className="sm-roll-badge">{s.st_id}</span></td>
                        <td style={{ fontWeight: 500 }}>{s.st_name || "—"}</td>
                        {/* Convert stored int IDs → human-readable labels */}
                        <td>{s.sem_id    ? semLabel(s.sem_id)       : "—"}</td>
                        <td>{s.branch_id ? branchLabel(s.branch_id) : "—"}</td>
                        <td>{s.section   ? sectionLabel(s.section)  : "—"}</td>
                        <td>
                          <div className="sm-action-group">
                            <button className="sm-edit-btn"   onClick={() => openEdit(s)}>✏️ Edit</button>
                            <button className="sm-delete-btn" onClick={() => setDeleteTarget(s)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════════ */}
      {editModal && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <div>
                <div className="sm-modal-title">Edit <em>Student</em></div>
                <div className="sm-modal-subtitle">Roll No: {editModal} (read-only)</div>
              </div>
              <button className="sm-modal-close" onClick={() => setEditModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Roll number — read only */}
            <div className="sm-form-group">
              <label>Roll Number</label>
              <input type="text" value={editModal} disabled />
              <div className="sm-form-note">Roll number cannot be changed</div>
            </div>

            {/* Name */}
            <div className="sm-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={editForm.st_name}
                placeholder="Enter student name"
                onChange={e => setEditForm(f => ({ ...f, st_name: e.target.value }))}
              />
            </div>

            {/* Semester */}
            <div className="sm-form-group">
              <label>Semester</label>
              <select value={editForm.sem_id} onChange={e => setEditForm(f => ({ ...f, sem_id: e.target.value }))}>
                <option value="">Select Semester</option>
                {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Branch — populated dynamically based on selected semester */}
            <div className="sm-form-group">
              <label>Branch</label>
              <select
                value={editForm.branch_id}
                onChange={e => setEditForm(f => ({ ...f, branch_id: e.target.value }))}
                disabled={!editForm.sem_id}
              >
                <option value="">{editForm.sem_id ? "Select Branch" : "Select a semester first"}</option>
                {editBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="sm-form-group">
              <label>Section</label>
              <select value={editForm.section} onChange={e => setEditForm(f => ({ ...f, section: e.target.value }))}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Password */}
            <div className="sm-form-group">
              <label>Password</label>
              <input
                type="text"
                value={editForm.password}
                placeholder="Enter password"
                onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="sm-modal-actions">
              <button className="sm-btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="sm-btn-save"   onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD STUDENT MODAL ═══════════════════════════════════════════════════ */}
      {addModal && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <div className="sm-modal-title">Add <em>Student</em></div>
              <button className="sm-modal-close" onClick={() => setAddModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Roll number */}
            <div className="sm-form-group">
              <label>Roll Number</label>
              <input
                type="text"
                value={addForm.st_id}
                placeholder="e.g. 22A91A0501"
                onChange={e => setAddForm(f => ({ ...f, st_id: e.target.value }))}
              />
            </div>

            {/* Name */}
            <div className="sm-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={addForm.st_name}
                placeholder="Enter student name"
                onChange={e => setAddForm(f => ({ ...f, st_name: e.target.value }))}
              />
            </div>

            {/* Semester */}
            <div className="sm-form-group">
              <label>Semester</label>
              <select value={addForm.sem_id} onChange={e => setAddForm(f => ({ ...f, sem_id: e.target.value }))}>
                <option value="">Select Semester</option>
                {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Branch — populated dynamically based on selected semester */}
            <div className="sm-form-group">
              <label>Branch</label>
              <select
                value={addForm.branch_id}
                onChange={e => setAddForm(f => ({ ...f, branch_id: e.target.value }))}
                disabled={!addForm.sem_id}
              >
                <option value="">{addForm.sem_id ? "Select Branch" : "Select a semester first"}</option>
                {addBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="sm-form-group">
              <label>Section</label>
              <select value={addForm.section} onChange={e => setAddForm(f => ({ ...f, section: e.target.value }))}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Password */}
            <div className="sm-form-group">
              <label>Password</label>
              <input
                type="text"
                value={addForm.password}
                placeholder="Set a password"
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="sm-modal-actions">
              <button className="sm-btn-cancel" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="sm-btn-save"   onClick={saveAdd} disabled={saving}>
                {saving ? "Adding…" : "➕ Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="sm-confirm-box">
            <h3>Delete Student?</h3>
            <p>
              This will permanently remove <strong>{deleteTarget.st_name || deleteTarget.st_id}</strong>{" "}
              (<span style={{ fontFamily: "monospace", color: "#C97B2E" }}>{deleteTarget.st_id}</span>) from the system.
              This action cannot be undone.
            </p>
            <div className="sm-confirm-actions">
              <button className="sm-btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="sm-btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? "Deleting…" : "🗑️ Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ═══════════════════════════════════════════════════════════════ */}
      <div className={`sm-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}