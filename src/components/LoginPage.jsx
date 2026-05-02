import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .wrapper {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
  }
  .nav-brand { display: flex; align-items: center; gap: 12px; }
  .nav-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;
  }
  .nav-title h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .nav-title p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .theme-toggle {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; background: #F0EDE6;
    border: 1px solid #E2DDD5; border-radius: 20px;
    font-size: 13px; font-weight: 500; color: #555; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  /* PAGE BODY */
  .page-body {
    flex: 1; display: flex;
    align-items: center; justify-content: center;
    padding: 48px 24px;
  }

  /* LOGIN CARD */
  .login-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 18px;
    padding: 40px 40px 36px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    width: 100%; max-width: 420px;
  }

  .section-label {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  }
  .section-label::before {
    content: ''; width: 3px; height: 16px;
    background: #C97B2E; border-radius: 2px;
  }
  .section-label span {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase; color: #AAA;
  }

  .login-card h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 30px; font-weight: 400;
    color: #1A1A1A; margin-bottom: 6px; line-height: 1.2;
  }
  .login-card h2 em { font-style: italic; color: #C97B2E; }
  .login-card > p  { font-size: 14px; color: #888; margin-bottom: 30px; }

  /* FORM */
  .form-group { margin-bottom: 18px; }
  .form-group label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 0.8px; text-transform: uppercase;
    color: #666; margin-bottom: 8px;
  }
  .input-wrapper { position: relative; }
  .input-wrapper .icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); width: 18px; height: 18px; color: #BBB;
    pointer-events: none;
  }
  .form-group input {
    width: 100%; padding: 13px 14px 13px 42px;
    border: 1.5px solid #E8E4DC; border-radius: 12px;
    background: #FAFAF7; font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-group input::placeholder { color: #BBB; }
  .form-group input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }

  .eye-btn {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%); background: none;
    border: none; cursor: pointer; color: #AAA; padding: 4px;
    display: flex; align-items: center;
  }

  .form-footer {
    display: flex; align-items: center;
    justify-content: space-between;
    margin: 6px 0 24px;
  }
  .remember {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #666; cursor: pointer; user-select: none;
  }
  .remember input[type="checkbox"] {
    width: 15px; height: 15px; accent-color: #C97B2E; cursor: pointer;
  }
  .forgot {
    font-size: 13px; color: #C97B2E; font-weight: 500;
    cursor: pointer; background: none; border: none; font-family: inherit;
  }
  .forgot:hover { text-decoration: underline; }

  /* LOGIN BTN */
  .btn-login {
    width: 100%; padding: 15px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.3px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(201,123,46,0.30);
  }
  .btn-login:hover:not(:disabled) {
    background: #B56E25;
    box-shadow: 0 6px 20px rgba(201,123,46,0.38);
  }
  .btn-login:active:not(:disabled) { transform: scale(0.99); }
  .btn-login:disabled { opacity: 0.75; cursor: wait; }

  .secure-note {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; margin-top: 18px;
    font-size: 12px; color: #AAA;
  }

  /* TOAST */
  .toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999; transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .toast.success { background: #2E7D52; }
  .toast.error   { background: #C0392B; }

  .footer-note {
    text-align: center; font-size: 12px; color: #AAA; margin-top: 20px;
    font-family: 'DM Sans', sans-serif;
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [roll, setRoll] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogin = async () => {
    if (!roll.trim() || !pass.trim()) {
      showToast("Please enter your credentials", "error");
      return;
    }

    setLoading(true);

    // 1. Check Student
    const { data: student } = await supabase
      .from("student")
      .select("*")
      .eq("st_id", roll)
      .eq("password", pass)
      .maybeSingle();

    if (student) {
      const now = new Date().toISOString();

      // 2. Check if exam is active for THIS student
      const { data: exams } = await supabase
        .from("conduct_exam")
        .select("*")
        .lte("start_time", now)
        .gte("end_time", now)
        .eq("sem_id", student.sem_id)
        .eq("branch_id", student.branch_id)
        .eq("section", student.section);

      setLoading(false);
      showToast(`Welcome, ${student.st_name}`, "success");
      localStorage.setItem("user", JSON.stringify(student));
      localStorage.setItem("role", "student");

      setTimeout(() => {
        if (exams && exams.length > 0) {
          // store exams for next page
          localStorage.setItem("active_exams", JSON.stringify(exams));
          navigate("/enter-key");
        } else {
          navigate("/exam-dashboard");
        }
      }, 1200);

      return;
    }

    // 3. Check Admin
    const { data: admin } = await supabase
      .from("admin")
      .select("*")
      .eq("ad_id", roll)
      .eq("password", pass)
      .maybeSingle();

    setLoading(false);

    if (admin) {
      showToast(`Welcome Admin, ${admin.ad_name}`, "success");
      localStorage.setItem("user", JSON.stringify(admin));
      localStorage.setItem("role", "admin");

      // 🧹 Delete all exam_keys for expired exams (runs silently on admin login)
      try {
        const cleanupNow = new Date().toISOString();
        const { data: expiredExams } = await supabase
          .from("conduct_exam")
          .select("exam_id")
          .lt("end_time", cleanupNow);

        if (expiredExams && expiredExams.length > 0) {
          const expiredIds = expiredExams.map((e) => e.exam_id);
          await supabase
            .from("exam_keys")
            .delete()
            .in("exam_id", expiredIds);
        }
      } catch (cleanupErr) {
        console.error("Key cleanup failed:", cleanupErr);
      }

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1200);

      return;
    }

    showToast("Invalid credentials", "error");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="wrapper">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo">DT</div>
            <div className="nav-title">
              <h1>Exam Dashboard</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <button className="theme-toggle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Light
          </button>
        </nav>

        {/* BODY */}
        <div className="page-body">
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <div className="login-card">
              <div className="section-label"><span>Assessment Portal</span></div>
              <h2>Sign In to Your <em>Exam</em></h2>
              <p>Enter your roll number and password to begin</p>

              <div className="form-group">
                <label>User ID</label>
                <div className="input-wrapper">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your ID"
                    value={roll}
                    onChange={e => setRoll(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{ paddingRight: "42px" }}
                  />
                  <button className="eye-btn" onClick={() => setShowPass(s => !s)}>
                    {showPass
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button className="forgot">Forgot password?</button>
              </div>

              <button className="btn-login" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in…" : "Login to Dashboard"}
              </button>

              <div className="secure-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Your session is secure and encrypted
              </div>
            </div>

            <p className="footer-note">
              Each exam session is timed. Ensure a stable connection before starting.
            </p>
          </div>
        </div>

        <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
      </div>
    </>
  );
}