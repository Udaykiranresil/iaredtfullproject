import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import FlipCard from "./components/FlipCard";
import AdminModal from "./components/AdminModal";
import UploadPage from "./components/UploadPage";
import { supabase } from "./supabase";
import { Routes, Route, useNavigate } from "react-router-dom";
import ExamPage from "./components/ExamPage";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import ExamDashboard from "./components/ExamDashboard";
import CreateExam from "./components/CreateExam";
import EnterKey from "./components/EnterKey";
import ConductedExamPage from "./components/ConductedExamPage";
import StudentManagement from "./components/StudentManagement";
import AdminManagement from "./components/AdminManagement";
import ExamKeysPage from "./components/Examkeyspage";
import ExamKeysDetail from "./components/Examkeysdetail";
import ExamResults from "./components/ExamResults";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [data, setData] = useState({ semesters: [] });

  const selectedModuleRef = useRef(null);

  // ── Load sidebar tree ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const { data: semData, error } = await supabase
      .from("semesters")
      .select(`
        id, label,
        branches (
          id, label,
          subjects (
            id, label,
            modules ( id, label )
          )
        )
      `);
    if (error) { console.error(error); return; }
    setData({
      semesters: semData.map(sem => ({
        id: sem.id, label: sem.label, branches: sem.branches || []
      }))
    });
  }, []);

  // ── Load questions for selected module ────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    const sel = selectedModuleRef.current;
    if (!sel) return;
    const { sem, branch, subj, mod } = sel;
    const { data: d, error } = await supabase
      .from("dt_questions").select("*")
      .eq("sem_id", sem.id).eq("branch_id", branch.id)
      .eq("subject_id", subj.id).eq("module_id", mod.id);
    if (error) { console.error(error); return; }
    if (d) setQuestions(d.map(i => [i.question, i.answer]));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Realtime: sidebar structure ───────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("sidebar-realtime")
      .on("postgres_changes", { event:"*", schema:"public", table:"semesters" }, loadData)
      .on("postgres_changes", { event:"*", schema:"public", table:"branches" },  loadData)
      .on("postgres_changes", { event:"*", schema:"public", table:"subjects" },  loadData)
      .on("postgres_changes", { event:"*", schema:"public", table:"modules" },   loadData)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadData]);

  // ── Realtime: questions (debounced for chunked inserts) ───────────────────────
  useEffect(() => {
    let timer = null;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(() => loadQuestions(), 300); };
    const ch = supabase.channel("questions-realtime")
      .on("postgres_changes", { event:"*", schema:"public", table:"dt_questions" }, debounced)
      .subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(ch); };
  }, [loadQuestions]);

  // ── Resize ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const [activeCard, setActiveCard] = useState(null);
  const [meta, setMeta] = useState({ sem:"—", subj:"—", mod:"—" });

  const selectModule = async (sem, branch, subj, mod, index) => {
    selectedModuleRef.current = { sem, branch, subj, mod };
    const { data: d, error } = await supabase
      .from("dt_questions").select("*")
      .eq("sem_id", sem.id).eq("branch_id", branch.id)
      .eq("subject_id", subj.id).eq("module_id", mod.id);
    if (error) { console.error(error); return; }
    if (d) setQuestions(d.map(i => [i.question, i.answer]));
    setMeta({ sem: sem.label, subj: subj.label, mod: `Module ${index + 1}: ${mod.label}` });
  };

  const downloadPDF = () => {
    if (!questions.length) { alert("Please select a module first"); return; }
    const content = questions.map((qa, i) => `Q${i + 1}: ${qa[0]}\nA: ${qa[1]}\n`).join("\n");
    const blob = new Blob([content], { type:"text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${meta.subj}_${meta.mod}.txt`;
    a.click();
  };

  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={
        <>
          {isMobile && <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>}
          {isMobile && <div className={`overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />}

          <div className="layout">
            <Sidebar
              data={data} selectModule={selectModule}
              sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
              isMobile={isMobile}
            />
            <main className="main-content">
              <div className="page-header">
                <div className="page-header-left">
                  <h1>{meta.subj !== "—" ? `${meta.subj} — ${meta.mod}` : "Welcome Back 👋"}</h1>
                  <p>{questions.length > 0
                    ? `Showing ${questions.length} questions. Click any card to reveal the answer.`
                    : "Select a semester, branch, subject and module to begin studying."}</p>
                </div>
                <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                  {questions.length > 0 && <button className="btn-download" onClick={downloadPDF}><span>⬇</span> Download TXT</button>}
                  {questions.length > 0 && (
                    <button className="btn-practice" onClick={() => navigate("/exam", { state: { questions, meta } })}>
                      🧠Start Practice Test
                    </button>
                  )}
                  <button className="btn-login" onClick={() => navigate("/login")}>👤 Login</button>
                </div>
              </div>

              <div className="divider" />

              <div className="breadcrumb">
                <span className="bc-item">{meta.sem}</span><span className="sep">›</span>
                <span className="bc-item">{meta.subj}</span><span className="sep">›</span>
                <span className="bc-item">{meta.mod}</span>
              </div>

              <div className="info-cards">
                <div className="info-card"><div className="info-icon sem">📚</div><div className="info-text"><label>Semester</label><span>{meta.sem}</span></div></div>
                <div className="info-card"><div className="info-icon subj">🔬</div><div className="info-text"><label>Subject</label><span>{meta.subj}</span></div></div>
                <div className="info-card"><div className="info-icon mod">🗂️</div><div className="info-text"><label>Module</label><span>{meta.mod}</span></div></div>
              </div>

              <div className="question-grid">
                {questions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎓</div>
                    <h2>Your study cards will appear here</h2>
                    <p>Select a semester, branch, subject and module to begin.</p>
                  </div>
                ) : (
                  questions.map((x, i) => (
                    <FlipCard key={i} q={x[0]} a={x[1]} i={i} activeCard={activeCard} setActiveCard={setActiveCard} />
                  ))
                )}
              </div>
            </main>
          </div>

          {admin && <AdminModal close={() => setAdmin(false)} openUpload={() => setUpload(true)} />}
          
        </>
      } />

      <Route path="/exam"                element={<ExamPage />} />
      <Route path="/exam/:exam_id"       element={<ConductedExamPage />} />
      <Route path="/login"               element={<LoginPage />} />
      <Route path="/admin-dashboard"     element={<AdminDashboard />} />
      <Route path="/create-exam"         element={<CreateExam />} />
      <Route path="/enter-key"           element={<EnterKey />} />
      <Route path="/exam-dashboard"      element={<ExamDashboard />} />
      <Route path="/student-management"  element={<StudentManagement />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/admin-management" element={<AdminManagement />} />
      <Route path="/exam-keys"            element={<ExamKeysPage />} />
      <Route path="/exam-keys/sem/:semId" element={<ExamKeysDetail />} />
      <Route path="/exam-results"         element={<ExamResults />} />
    </Routes>
  );
}
