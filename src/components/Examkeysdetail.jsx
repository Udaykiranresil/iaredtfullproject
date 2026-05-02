import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ekd-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .ekd-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
    position: sticky; top: 0; z-index: 10;
  }
  .ekd-brand { display: flex; align-items: center; gap: 12px; }
  .ekd-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .ekd-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .ekd-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .ekd-nav-actions { display: flex; align-items: center; gap: 10px; }

  .ekd-back {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: #F0EDE6;
    border: 1px solid #E2DDD5;
    border-radius: 10px;
    color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .ekd-back:hover { background: #E8E4DC; }

  .ekd-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .ekd-logout:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); }

  /* MAIN */
  .ekd-main {
    flex: 1;
    max-width: 1050px;
    width: 100%;
    margin: 0 auto;
    padding: 48px 28px 60px;
  }

  /* HEADER */
  .ekd-header { margin-bottom: 32px; }
  .ekd-header-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ekd-header-label::before { content: ''; width: 3px; height: 16px; background: #C97B2E; border-radius: 2px; }
  .ekd-header-label span { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #AAA; }
  .ekd-header h2 { font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400; color: #1A1A1A; line-height: 1.2; }
  .ekd-header h2 em { font-style: italic; color: #C97B2E; }
  .ekd-header p { font-size: 14px; color: #888; margin-top: 6px; }

  /* EXAM INFO STRIP */
  .ekd-info-strip {
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-bottom: 28px;
  }
  .ekd-info-chip {
    display: flex; align-items: center; gap: 8px;
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  }
  .ekd-info-chip-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #BBB; margin-right: 4px; }
  .ekd-info-chip-value { font-weight: 600; color: #1A1A1A; }

  /* STATUS PILL */
  .ekd-status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 12px; font-weight: 600;
  }
  .ekd-status-pill.inprogress { background: #ECFDF5; color: #059669; border: 1px solid rgba(5,150,105,0.2); }
  .ekd-status-pill.completed  { background: #F5F3EE; color: #888; border: 1px solid #E2DDD5; }

  /* CARD */
  .ekd-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 16px;
    padding: 24px 24px 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }

  .ekd-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px;
  }
  .ekd-card-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: #AAA;
    display: flex; align-items: center; gap: 8px;
  }
  .ekd-card-title::before { content: ''; width: 3px; height: 12px; background: #C97B2E; border-radius: 2px; }

  .ekd-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FFF8F0; border: 1px solid rgba(201,123,46,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
  }

  /* SEARCH */
  .ekd-search-row { display: flex; gap: 10px; margin-bottom: 20px; }
  .ekd-search-wrap { position: relative; flex: 1; max-width: 360px; }
  .ekd-search-input {
    width: 100%;
    padding: 11px 16px 11px 40px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ekd-search-input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .ekd-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: #BBB; pointer-events: none;
  }

  /* TABLE */
  .ekd-table-wrap { overflow-x: auto; }
  .ekd-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .ekd-table th {
    text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: #AAA; padding: 11px 14px;
    border-bottom: 1.5px solid #ECEAE4;
    background: #FAFAF7;
    white-space: nowrap;
  }
  .ekd-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #F0EDE6;
    color: #333; vertical-align: middle;
  }
  .ekd-table tr:last-child td { border-bottom: none; }
  .ekd-table tr:hover td { background: #FFFDF9; }

  .ekd-roll-badge {
    display: inline-block;
    background: #FFF8F0;
    border: 1px solid rgba(201,123,46,0.2);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
    font-family: monospace; letter-spacing: 0.5px;
  }

  .ekd-key-badge {
    display: inline-block;
    background: #F0EDF8;
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 13px; font-weight: 700; color: #7C3AED;
    font-family: 'Courier New', monospace; letter-spacing: 2px;
  }

  /* LOADING / EMPTY / ERROR */
  .ekd-loading { text-align: center; padding: 40px; color: #C97B2E; font-size: 14px; }
  .ekd-empty {
    text-align: center; padding: 40px 20px;
    color: #AAA;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .ekd-empty-icon { font-size: 34px; }
  .ekd-empty span { font-size: 14px; }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .ekd-nav { padding: 12px 16px; }
    .ekd-main { padding: 28px 14px 48px; }
    .ekd-header h2 { font-size: 24px; }
    .ekd-card { padding: 16px 12px; }
    .ekd-nav-actions .ekd-logout span { display: none; }
    .ekd-brand-text h1 { font-size: 13px; }
  }
`;

const formatTime = (iso) => {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", // ✅ FIX
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatus = (start_time, end_time) => {
  if (!start_time || !end_time) return "upcoming";

  const now = new Date();
  const start = new Date(start_time);
  const end = new Date(end_time);

  if (now >= start && now <= end) return "inprogress";
  if (now > end) return "completed";
  return "upcoming";
};

export default function ExamKeysDetail() {
  const navigate = useNavigate();
  const { semId } = useParams();

  const [exam, setExam] = useState(null);
  const [keys, setKeys] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date().toISOString();

        // 1️⃣ Get ACTIVE exam for this semester
        const { data: examData, error: examErr } = await supabase
          .from("conduct_exam")
          .select("exam_id, exam_name, subject_id, start_time, end_time")
          .eq("sem_id", semId)
          .lte("start_time", now)
          .gte("end_time", now)
          .limit(1)
          .single();

        if (examErr || !examData) {
          setError("No active exam found for this semester.");
          setLoading(false);
          return;
        }

        // 2️⃣ Get exam keys (only active exam students)
        const { data: keysData, error: keysErr } = await supabase
          .from("exam_keys")
          .select(`
    key_id,
    exam_key,
    is_used,
    student:st_id (
      st_id,
      st_name,
      sem_id
    )
  `)
          .eq("exam_id", examData.exam_id);

        const filteredKeys = (keysData || []).filter(
          k => k.student?.sem_id == semId
        );
        if (keysErr) {
          setError("Failed to load student keys.");
          setLoading(false);
          return;
        }

        setExam(examData);
        setKeys(filteredKeys);
        setFiltered(filteredKeys);
        setLoading(false);

      } catch (err) {
        setError("Something went wrong.");
        setLoading(false);
      }
    };

    if (semId) fetchData();
  }, [semId]);

  // Live search filter
  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) { setFiltered(keys); return; }
    setFiltered(
      keys.filter(k =>
        k.student?.st_name?.toLowerCase().includes(term) ||
        k.student?.st_id?.toLowerCase().includes(term) ||
        k.exam_key?.toLowerCase().includes(term)
      )
    );
  }, [search, keys]);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const status = exam ? getStatus(exam.start_time, exam.end_time) : null;

  const toggleKeyStatus = async (exam_key, currentStatus) => {
    try {
      const { error } = await supabase
        .from("exam_keys")
        .update({ is_used: !currentStatus })
        .eq("exam_key", exam_key); // ✅ FIXED

      if (error) {
        console.error(error);
        alert("Failed to update status");
        return;
      }

      // update UI
      const updated = keys.map(k =>
        k.exam_key === exam_key
          ? { ...k, is_used: !currentStatus }
          : k
      );

      setKeys(updated);
      setFiltered(updated);

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ekd-wrapper">

        {/* NAVBAR */}
        <nav className="ekd-nav">
          <div className="ekd-brand">
            <div className="ekd-logo">DT</div>
            <div className="ekd-brand-text">
              <h1>Exam Keys Detail</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="ekd-nav-actions">
            <button className="ekd-back" onClick={() => navigate("/exam-keys")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Exams
            </button>
            <button className="ekd-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main className="ekd-main">

          {loading && <div className="ekd-loading">⏳ Loading exam data…</div>}

          {error && !loading && (
            <div className="ekd-card">
              <div className="ekd-empty">
                <div className="ekd-empty-icon">⚠️</div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && exam && (
            <>
              {/* PAGE HEADER */}
              <div className="ekd-header">
                <div className="ekd-header-label"><span>Admin · Exam Keys · Detail</span></div>
                <h2><em>{exam.exam_name}</em></h2>
                <p>Student keys for this exam session.</p>
              </div>

              {/* EXAM INFO STRIP */}
              <div className="ekd-info-strip">
                <div className="ekd-info-chip">
                  <span className="ekd-info-chip-label">Subject</span>
                  <span className="ekd-info-chip-value">📚 {exam.subject || "—"}</span>
                </div>
                <div className="ekd-info-chip">
                  <span className="ekd-info-chip-label">Start</span>
                  <span className="ekd-info-chip-value">{formatTime(exam.start_time)}</span>
                </div>
                <div className="ekd-info-chip">
                  <span className="ekd-info-chip-label">End</span>
                  <span className="ekd-info-chip-value">{formatTime(exam.end_time)}</span>
                </div>
                <div className="ekd-info-chip">
                  <span className="ekd-info-chip-label">Status</span>
                  {status === "inprogress" && (
                    <span className="ekd-status-pill inprogress">
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                      In Progress
                    </span>
                  )}
                  {status === "completed" && (
                    <span className="ekd-status-pill completed">✓ Completed</span>
                  )}
                  {status === "upcoming" && (
                    <span className="ekd-status-pill completed">🕒 Upcoming</span>
                  )}
                </div>
              </div>

              {/* KEYS TABLE CARD */}
              <div className="ekd-card">
                <div className="ekd-card-header">
                  <div className="ekd-card-title">Student Keys</div>
                  {keys.length > 0 && (
                    <span className="ekd-count-badge">
                      🔑 {keys.length} key{keys.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Search */}
                {keys.length > 0 && (
                  <div className="ekd-search-row">
                    <div className="ekd-search-wrap">
                      <svg className="ekd-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        className="ekd-search-input"
                        type="text"
                        placeholder="Search by name, roll number or key…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Table */}
                {keys.length === 0 ? (
                  <div className="ekd-empty">
                    <div className="ekd-empty-icon">🔑</div>
                    <span>No exam keys found for this exam.</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="ekd-empty">
                    <div className="ekd-empty-icon">🔍</div>
                    <span>No results match your search.</span>
                  </div>
                ) : (
                  <div className="ekd-table-wrap">
                    <table className="ekd-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Roll Number</th>
                          <th>Student Name</th>
                          <th>Exam Key</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((k, idx) => (
                          <tr key={k.key_id || idx}>
                            <td style={{ color: "#CCC", fontSize: 12 }}>{idx + 1}</td>

                            <td>
                              <span className="ekd-roll-badge">
                                {k.student?.st_id || "—"}
                              </span>
                            </td>

                            <td style={{ fontWeight: 500 }}>
                              {k.student?.st_name || "—"}
                            </td>

                            {/* ✅ FIXED: exam key in correct column */}
                            <td>
                              <span className="ekd-key-badge">
                                {k.exam_key || "—"}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  if (k.is_used) {
                                    toggleKeyStatus(k.exam_key, k.is_used); // allow only revert
                                  } else {
                                    alert("Only system can mark key as used");
                                  }
                                }}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  background: k.is_used ? "#FEE2E2" : "#DCFCE7",
                                  color: k.is_used ? "#DC2626" : "#059669"
                                }}
                              >
                                {k.is_used ? "Used" : "Unused"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div >
    </>
  );
}