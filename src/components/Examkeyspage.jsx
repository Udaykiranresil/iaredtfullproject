import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ek-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  .ek-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
    position: sticky; top: 0; z-index: 10;
  }
  .ek-brand { display: flex; align-items: center; gap: 12px; }
  .ek-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .ek-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .ek-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .ek-nav-actions { display: flex; align-items: center; gap: 10px; }

  .ek-back {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: #F0EDE6; border: 1px solid #E2DDD5; border-radius: 10px;
    color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .ek-back:hover { background: #E8E4DC; }

  .ek-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.18); border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .ek-logout:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); }

  .ek-main {
    flex: 1; max-width: 1080px; width: 100%;
    margin: 0 auto; padding: 48px 28px 60px;
  }

  .ek-header { margin-bottom: 40px; }
  .ek-header-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ek-header-label::before { content: ''; width: 3px; height: 16px; background: #C97B2E; border-radius: 2px; }
  .ek-header-label span { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #AAA; }
  .ek-header h2 { font-family: 'DM Serif Display', serif; font-size: 34px; font-weight: 400; color: #1A1A1A; line-height: 1.2; }
  .ek-header h2 em { font-style: italic; color: #C97B2E; }
  .ek-header p { font-size: 14px; color: #888; margin-top: 6px; }

  .ek-sem-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .ek-sem-card {
    background: #FFFFFF;
    border: 1.5px solid #ECEAE4;
    border-radius: 20px;
    padding: 28px 28px 60px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .ek-sem-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #C97B2E, #e8a030);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ek-sem-card:hover {
    border-color: #C97B2E;
    box-shadow: 0 8px 32px rgba(201,123,46,0.16);
    transform: translateY(-3px);
  }
  .ek-sem-card:hover::before { opacity: 1; }

  .ek-sem-number {
    font-family: 'DM Serif Display', serif;
    font-size: 56px;
    font-weight: 400;
    color: #ECEAE4;
    line-height: 1;
    margin-bottom: 14px;
    transition: color 0.2s;
    user-select: none;
  }
  .ek-sem-card:hover .ek-sem-number { color: rgba(201,123,46,0.15); }

  .ek-sem-label {
    font-size: 18px;
    font-weight: 600;
    color: #1A1A1A;
    margin-bottom: 6px;
  }

  .ek-sem-sub {
    font-size: 12px;
    color: #AAA;
    margin-bottom: 20px;
  }

  .ek-sem-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ek-sem-stat {
    display: inline-flex; align-items: center; gap: 5px;
    background: #F5F3EE; border: 1px solid #E8E4DC;
    border-radius: 8px; padding: 5px 10px;
    font-size: 11px; font-weight: 600; color: #777;
    transition: all 0.2s;
  }
  .ek-sem-card:hover .ek-sem-stat {
    background: #FFF8F0;
    border-color: rgba(201,123,46,0.2);
    color: #C97B2E;
  }

  .ek-sem-arrow {
    position: absolute;
    bottom: 24px; right: 24px;
    color: #D8D4CC;
    transition: color 0.2s, transform 0.2s;
  }
  .ek-sem-card:hover .ek-sem-arrow {
    color: #C97B2E;
    transform: translateX(4px);
  }

  .ek-loading { text-align: center; padding: 60px; color: #C97B2E; font-size: 14px; }

  @media (max-width: 600px) {
    .ek-nav { padding: 12px 16px; }
    .ek-main { padding: 28px 14px 48px; }
    .ek-header h2 { font-size: 26px; }
    .ek-sem-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
    .ek-sem-card { padding: 20px 18px 52px; }
    .ek-sem-number { font-size: 40px; }
    .ek-brand-text h1 { font-size: 13px; }
  }
`;

const SEM_EMOJIS = ["🌱", "📖", "🔬", "⚙️", "🚀", "🎓"];

export default function ExamKeysPage() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [examCounts, setExamCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [semRes, examRes] = await Promise.all([
        supabase.from("semesters").select("id, label").order("id"),
        supabase.from("conduct_exam").select("sem_id"),
      ]);
      setSemesters(semRes.data || []);
      const counts = {};
      (examRes.data || []).forEach(e => {
        counts[e.sem_id] = (counts[e.sem_id] || 0) + 1;
      });
      setExamCounts(counts);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <>
      <style>{styles}</style>
      <div className="ek-wrapper">
        <nav className="ek-nav">
          <div className="ek-brand">
            <div className="ek-logo">DT</div>
            <div className="ek-brand-text">
              <h1>Exam Keys</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="ek-nav-actions">
            <button className="ek-back" onClick={() => navigate("/admin-dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Dashboard
            </button>
            <button className="ek-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </nav>

        <main className="ek-main">
          <div className="ek-header">
            <div className="ek-header-label"><span>Admin · Exam Management</span></div>
            <h2>Select a <em>Semester</em></h2>
            <p>Choose a semester to view its exams and student keys.</p>
          </div>

          {loading ? (
            <div className="ek-loading">⏳ Loading semesters…</div>
          ) : (
            <div className="ek-sem-grid">
              {semesters.map((sem, idx) => {
                const count = examCounts[sem.id] || 0;
                return (
                  <div
                    key={sem.id}
                    className="ek-sem-card"
                    onClick={() => navigate(`/exam-keys/sem/${sem.id}`)}
                  >
                    <div className="ek-sem-number">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="ek-sem-label">{SEM_EMOJIS[idx] || "📚"} {sem.label}</div>
                    <div className="ek-sem-sub">Click to view exams &amp; student keys</div>
                    <div className="ek-sem-stats">
                      <span className="ek-sem-stat">📋 {count} exam{count !== 1 ? "s" : ""}</span>
                    </div>
                    <svg className="ek-sem-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}