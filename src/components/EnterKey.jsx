import { useState } from "react";
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
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .ek-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 18px;
    padding: 44px 40px 40px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    width: 100%;
    max-width: 420px;
    text-align: center;
  }

  .ek-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #C97B2E, #e8a030);
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(201,123,46,0.30);
  }

  .ek-label {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-bottom: 8px;
  }
  .ek-label::before {
    content: ''; width: 3px; height: 16px;
    background: #C97B2E; border-radius: 2px;
  }
  .ek-label span {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase; color: #AAA;
  }
  .ek-label::after {
    content: ''; width: 3px; height: 16px;
    background: #C97B2E; border-radius: 2px;
  }

  .ek-card h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; font-weight: 400;
    color: #1A1A1A; margin-bottom: 8px; line-height: 1.2;
  }
  .ek-card h2 em { font-style: italic; color: #C97B2E; }

  .ek-card p {
    font-size: 13px; color: #888; margin-bottom: 28px;
    line-height: 1.5;
  }

  .ek-input-wrap {
    position: relative;
    margin-bottom: 16px;
  }
  .ek-input-wrap .ek-ico {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); color: #BBB;
    pointer-events: none; font-size: 16px;
  }
  .ek-input {
    width: 100%;
    padding: 14px 14px 14px 44px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    letter-spacing: 4px;
    color: #1A1A1A;
    outline: none;
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ek-input::placeholder { color: #CCC; letter-spacing: 1px; font-size: 14px; }
  .ek-input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }

  .ek-btn {
    width: 100%;
    padding: 15px;
    background: #C97B2E;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(201,123,46,0.30);
  }
  .ek-btn:hover:not(:disabled) {
    background: #B56E25;
    box-shadow: 0 6px 20px rgba(201,123,46,0.38);
  }
  .ek-btn:active:not(:disabled) { transform: scale(0.99); }
  .ek-btn:disabled { opacity: 0.75; cursor: wait; }

  .ek-note {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 16px; font-size: 12px; color: #AAA;
  }

  /* TOAST */
  .ek-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999;
    transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .ek-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .ek-toast.success { background: #2E7D52; }
  .ek-toast.error   { background: #C0392B; }
`;

export default function EnterKey() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleVerify = async () => {
    const exams = JSON.parse(localStorage.getItem("active_exams"));
    if (!user) {
      showToast("Session expired. Please login again.", "error");
      return;
    }
    if (!exams || exams.length === 0) {
      setLoading(false);
      showToast("No active exams found", "error");
      return;
    }

    if (!key.trim()) {
      showToast("Please enter your exam key", "error");
      return;
    }

    setLoading(true);

    // Validate the key
    const { data } = await supabase
      .from("exam_keys")
      .select("*")
      .eq("st_id", user.st_id)
      .eq("exam_key", key.trim())
      .eq("is_used", false)
      .limit(1)
      .maybeSingle();

    if (!data) {
      setLoading(false);
      showToast("Invalid or already used key", "error");
      return;
    }

    // Mark key as used
    await supabase
      .from("exam_keys")
      .update({ is_used: true })
      .eq("st_id", user.st_id)
      .eq("exam_key", key.trim());

    localStorage.setItem("key_verified", "true");

    setLoading(false);
    showToast("Key verified! Entering exam…", "success");

    setTimeout(() => navigate("/exam-dashboard"), 1200);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ek-wrapper">
        <div className="ek-card">
          <div className="ek-icon">🔐</div>

          <div className="ek-label"><span>2-Step Verification</span></div>
          <h2>Enter Your <em>Exam Key</em></h2>
          <p>
            Your proctor will provide the key at the start of the exam.
            Enter it below to begin.
          </p>

          <div className="ek-input-wrap">
            <span className="ek-ico">🗝️</span>
            <input
              className="ek-input"
              type="text"
              placeholder="Enter exam key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              maxLength={20}
            />
          </div>

          <button className="ek-btn" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying…" : "Verify & Start Exam →"}
          </button>

          <div className="ek-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Each key is single-use and tied to your ID
          </div>
        </div>
      </div>

      <div className={`ek-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}