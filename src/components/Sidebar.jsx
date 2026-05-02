import React, { useState } from "react";

export default function Sidebar({
  data,
  selectModule,
  sidebarOpen,
  setSidebarOpen,
  isMobile
}) {
  const [activeSem, setActiveSem] = useState(null);
  const [activeBranch, setActiveBranch] = useState({});
  const [activeSubj, setActiveSubj] = useState({});
  const [activeMod, setActiveMod] = useState(null);

  // ───────── TOGGLES ─────────

  const toggleSem = (semId) => {
    if (activeSem === semId) {
      // 🔴 close everything
      setActiveSem(null);
      setActiveBranch({});
      setActiveSubj({});
      setActiveMod(null);
    } else {
      setActiveSem(semId);
      setActiveBranch({});
      setActiveSubj({});
    }
  };

  const toggleBranch = (semId, branchId) => {
    setActiveBranch((prev) => ({
      ...prev,
      [semId]: prev[semId] === branchId ? null : branchId
    }));

    // reset subjects of this branch
    setActiveSubj((prev) => ({
      ...prev,
      [branchId]: null
    }));
  };

  const toggleSubj = (branchId, subjId) => {
    setActiveSubj((prev) => ({
      ...prev,
      [branchId]: prev[branchId] === subjId ? null : subjId
    }));
  };

  return (
    <aside
      className={`sidebar 
  ${isMobile ? (sidebarOpen ? "open" : "") : "desktop"}`}
    >

      {/* 🔹 BRAND */}
      <div className="sidebar-brand">
        <div className="logo-mark">DT</div>
        <div className="brand-text">
          <h2>Definition & Terminology</h2>
          <p>Learning Portal</p>
        </div>
      </div>

      {/* 🔹 NAVIGATION */}
      <div className="sidebar-section">
        <div className="section-label">Navigation</div>

        {data.semesters.map((sem) => (
          <div key={sem.id} className="sem-group">

            {/* ── SEMESTER ── */}
            <button
              className={`nav-btn ${activeSem === sem.id ? "active sem-open" : ""}`}
              onClick={() => toggleSem(sem.id)}
            >
              <span className="nav-icon">📘</span>
              <span>{sem.label}</span>
              <span className="chevron">
                {activeSem === sem.id ? "▼" : "›"}
              </span>
            </button>

            {/* ── BRANCH LIST ── */}
            <div className={`sub-nav ${activeSem === sem.id ? "open" : ""}`}>

              {sem.branches?.length === 0 && (
                <div className="empty">Coming soon…</div>
              )}

              {sem.branches?.map((branch) => (
                <div key={branch.id}>

                  {/* ── BRANCH ── */}
                  <button
                    className={`nav-btn ${activeBranch[sem.id] === branch.id ? "active" : ""
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBranch(sem.id, branch.id);
                    }}
                  >
                    <span className="nav-icon">🏫</span>
                    <span>{branch.label}</span>
                    <span className="chevron">
                      {activeBranch[sem.id] === branch.id ? "▼" : "›"}
                    </span>
                  </button>

                  {/* ── SUBJECT LIST ── */}
                  <div
                    className={`sub-nav ${activeSem === sem.id &&
                      activeBranch[sem.id] === branch.id
                      ? "open"
                      : ""
                      }`}
                  >
                    {branch.subjects?.map((subj) => (
                      <div key={subj.id}>

                        {/* ── SUBJECT ── */}
                        <button
                          className={`nav-btn ${activeSubj[branch.id] === subj.id ? "active" : ""
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubj(branch.id, subj.id);
                          }}
                        >
                          <span className="nav-icon">📄</span>
                          <span>{subj.label}</span>
                          <span className="chevron">
                            {activeSubj[branch.id] === subj.id ? "▼" : "›"}
                          </span>
                        </button>

                        {/* ── MODULE LIST ── */}
                        <div
                          className={`sub-nav ${activeSem === sem.id &&
                            activeBranch[sem.id] === branch.id &&
                            activeSubj[branch.id] === subj.id
                            ? "open"
                            : ""
                            }`}
                        >
                          {subj.modules.map((mod, i) => (
                            <button
                              key={i}
                              className={`nav-btn ${activeMod === mod.id ? "active" : ""
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMod(mod.id);
                                selectModule(sem, branch, subj, mod, i);

                                if (window.innerWidth <= 768) {
                                  setSidebarOpen(false);
                                }
                              }}
                            >
                              <span className="nav-icon">📄</span>
                              <span>Module {i + 1}: {mod.label}</span>
                            </button>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))}

            </div>
          </div>
        ))}
      </div>

    </aside>
  );
}