import React, { useState } from "react";

export default function AdminModal({ close, openUpload }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const verifyPassword = () => {
    if (password === "123") {
      setError("");
      close();
      openUpload();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-card">

        {/* HEADER */}
        <div className="admin-header">
          <h2>Admin Access</h2>
          <p>Enter your credentials to continue</p>
        </div>

        {/* INPUT */}
        <div className="admin-body">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className={`admin-input ${error ? "error" : ""}`}
          />

          {error && <span className="error-text">{error}</span>}
        </div>

        {/* ACTIONS */}
        <div className="admin-actions">
          <button className="btn-primary" onClick={verifyPassword}>
            Continue →
          </button>
          <button className="btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}