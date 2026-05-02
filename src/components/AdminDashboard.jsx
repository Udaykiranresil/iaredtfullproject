import { useNavigate } from "react-router-dom";


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ad-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .ad-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
  }
  .ad-brand { display: flex; align-items: center; gap: 12px; }
  .ad-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;
  }
  .ad-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .ad-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .ad-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .ad-logout:hover {
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.35);
  }

  /* MAIN */
  .ad-main {
    flex: 1;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    padding: 48px 28px 60px;
  }

  /* HEADER */
  .ad-header {
    margin-bottom: 40px;
  }
  .ad-header-label {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .ad-header-label::before {
    content: ''; width: 3px; height: 16px;
    background: #C97B2E; border-radius: 2px;
  }
  .ad-header-label span {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase; color: #AAA;
  }
  .ad-header h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 36px; font-weight: 400; color: #1A1A1A;
    line-height: 1.2;
  }
  .ad-header h2 em { font-style: italic; color: #C97B2E; }
  .ad-header p { font-size: 14px; color: #888; margin-top: 6px; }

  /* SECTION */
  .ad-section {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 16px;
    padding: 28px 28px 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .ad-section-title {
    font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: #AAA; margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
  }
  .ad-section-title::before {
    content: ''; width: 3px; height: 12px;
    background: #C97B2E; border-radius: 2px;
  }

  .ad-btn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .ad-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 18px;
    background: #FAFAF7;
    border: 1.5px solid #ECEAE4;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; color: #1A1A1A;
    text-align: left;
    transition: all 0.2s;
  }
  .ad-btn:hover {
    background: #FFF;
    border-color: #C97B2E;
    box-shadow: 0 4px 16px rgba(201,123,46,0.12);
    transform: translateY(-1px);
  }
  .ad-btn-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #C97B2E, #e8a030);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(201,123,46,0.28);
  }
  .ad-btn-text { display: flex; flex-direction: column; gap: 2px; }
  .ad-btn-text span { font-size: 13px; font-weight: 600; color: #1A1A1A; }
  .ad-btn-text small { font-size: 11px; color: #AAA; font-weight: 400; }

  /* WELCOME BADGE */
  .ad-welcome {
    display: inline-flex; align-items: center; gap: 8px;
    background: #FFF8F0;
    border: 1px solid rgba(201,123,46,0.2);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 13px; color: #C97B2E; font-weight: 500;
    margin-bottom: 20px;
  }
    .ad-nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ad-user {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #FFF8F0;
  border: 1px solid rgba(201,123,46,0.2);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: #C97B2E;
}
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ad-wrapper">

        {/* NAVBAR */}
        <nav className="ad-nav">
          <div className="ad-brand">
            <div className="ad-logo">DT</div>
            <div className="ad-brand-text">
              <h1>Admin Panel</h1>
              <p>Assessment Portal</p>
            </div>
          </div>

          <div className="ad-nav-right">
            <div className="ad-user">
              👤 {user?.ad_name || "Administrator"}
            </div>

            <button className="ad-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main className="ad-main">

          <div className="ad-header">
            <div className="ad-header-label"><span>Admin Dashboard</span></div>
            <h2>Manage Your <em>Exams</em></h2>
            <p>Create exams, upload questions, and configure the assessment portal.</p>
          </div>

          {/* Exam Management */}
          <div className="ad-section">
            <div className="ad-section-title">Exam Management</div>
            <div className="ad-btn-grid">
              <button className="ad-btn" onClick={() => navigate("/create-exam")}>
                <div className="ad-btn-icon">➕</div>
                <div className="ad-btn-text">
                  <span>Create Exam</span>
                  <small>Set up a new exam session</small>
                </div>
              </button>

              <button className="ad-btn" onClick={() => navigate("/upload")}>
                <div className="ad-btn-icon">📤</div>
                <div className="ad-btn-text">
                  <span>Upload Questions</span>
                  <small>Import from Excel file</small>
                </div>
              </button>

              <button className="ad-btn" onClick={() => navigate("/exam-keys")}>
                <div className="ad-btn-icon">🔑</div>
                <div className="ad-btn-text">
                  <span>Exam Keys</span>
                  <small>View student exam keys</small>
                </div>
              </button>
              <button
                className="ad-btn"
                onClick={() => navigate("/exam-results")}
              >
                <div className="ad-btn-icon">📊</div>
                <div className="ad-btn-text">
                  <span>Exam Results</span>
                  <small>View & download student results</small>
                </div>
              </button>
            </div>

          </div>


          {/* Student Management */}
          <div className="ad-section">
            <div className="ad-section-title">Student Management</div>
            <div className="ad-btn-grid">
              <button className="ad-btn" onClick={() => navigate("/student-management")}>
                <div className="ad-btn-icon">👥</div>
                <div className="ad-btn-text">
                  <span>Student Management</span>
                  <small>Search, edit & add students</small>
                </div>
              </button>
              <button
                className="ad-btn"
                onClick={() => navigate("/admin-management")}
              >
                <div className="ad-btn-icon">🛠️</div>
                <div className="ad-btn-text">
                  <span>Admin Management</span>
                  <small>Manage admin accounts</small>
                </div>
              </button>

            </div>
          </div>

        </main>
      </div>
    </>
  );
}