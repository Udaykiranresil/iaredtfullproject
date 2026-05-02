import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .am-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .am-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: #FAFAF7;
    border-bottom: 1px solid #ECEAE4;
    position: sticky; top: 0; z-index: 10;
  }
  .am-brand { display: flex; align-items: center; gap: 12px; }
  .am-logo {
    width: 40px; height: 40px;
    background: #C97B2E; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .am-brand-text h1 { font-size: 15px; font-weight: 600; color: #1A1A1A; line-height: 1; }
  .am-brand-text p  { font-size: 10px; font-weight: 500; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .am-nav-actions { display: flex; align-items: center; gap: 10px; }

  .am-back {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: #F0EDE6;
    border: 1px solid #E2DDD5;
    border-radius: 10px;
    color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .am-back:hover { background: #E8E4DC; }

  .am-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    color: #ef4444; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .am-logout:hover { background: rgba(239,68,68,0.12); }

  /* MAIN */
  .am-main {
    flex: 1;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 28px 60px;
  }

  /* HEADER */
  .am-header { margin-bottom: 32px; }
  .am-header-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .am-header-label::before { content: ''; width: 3px; height: 16px; background: #C97B2E; border-radius: 2px; }
  .am-header-label span { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #AAA; }
  .am-header h2 { font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400; color: #1A1A1A; line-height: 1.2; }
  .am-header h2 em { font-style: italic; color: #C97B2E; }
  .am-header p { font-size: 14px; color: #888; margin-top: 6px; }

  /* CARD */
  .am-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 16px;
    padding: 24px 24px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .am-card-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: #AAA; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .am-card-title::before { content: ''; width: 3px; height: 12px; background: #C97B2E; border-radius: 2px; }

  /* SEARCH ROW */
  .am-search-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .am-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .am-search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .am-search-input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .am-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #BBB; pointer-events: none;
  }
  .am-search-btn {
    padding: 12px 22px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(201,123,46,0.28);
    white-space: nowrap;
  }
  .am-search-btn:hover { background: #B56E25; transform: translateY(-1px); }

  /* ADD BTN */
  .am-add-btn {
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
  .am-add-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,123,46,0.36); }

  /* TABLE */
  .am-table-wrap { overflow-x: auto; margin-top: 4px; }
  .am-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .am-table th {
    text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: #AAA; padding: 12px 14px;
    border-bottom: 1.5px solid #ECEAE4;
    background: #FAFAF7;
  }
  .am-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #F0EDE6;
    color: #333; vertical-align: middle;
  }
  .am-table tr:last-child td { border-bottom: none; }
  .am-table tr:hover td { background: #FFFDF9; }

  .am-id-badge {
    display: inline-block;
    background: #FFF8F0;
    border: 1px solid rgba(201,123,46,0.2);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
    letter-spacing: 0.5px;
    font-family: monospace;
  }

  .am-edit-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1.5px solid #C97B2E;
    border-radius: 8px;
    color: #C97B2E;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .am-edit-btn:hover { background: #C97B2E; color: #fff; }

  .am-delete-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1.5px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .am-delete-btn:hover { background: #ef4444; color: #fff; }

  .am-action-group { display: flex; align-items: center; gap: 6px; }

  /* STATUS / EMPTY */
  .am-loading { text-align: center; padding: 30px; color: #C97B2E; font-size: 14px; }
  .am-empty { text-align: center; padding: 40px 20px; color: #AAA; font-size: 15px; }
  .am-empty-icon { font-size: 36px; margin-bottom: 10px; }

  .am-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FFF8F0; border: 1px solid rgba(201,123,46,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #C97B2E;
  }

  /* MODAL */
  .am-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .am-modal {
    background: #FAFAF7;
    border-radius: 18px;
    padding: 32px;
    width: 100%; max-width: 440px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid #ECEAE4;
    animation: am-modal-in 0.25s cubic-bezier(0.22,1,0.36,1);
  }
  @keyframes am-modal-in {
    from { opacity: 0; transform: scale(0.93) translateY(12px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
  }
  .am-modal-header {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px;
  }
  .am-modal-title { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; color: #1A1A1A; }
  .am-modal-title em { font-style: italic; color: #C97B2E; }
  .am-modal-subtitle { font-size: 12px; color: #AAA; margin-top: 4px; }
  .am-modal-close {
    background: none; border: none; cursor: pointer; color: #AAA; padding: 4px;
    border-radius: 6px; transition: color 0.2s; display: flex; align-items: center;
  }
  .am-modal-close:hover { color: #555; }

  .am-form-group { margin-bottom: 16px; }
  .am-form-group label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 0.8px; text-transform: uppercase;
    color: #666; margin-bottom: 7px;
  }
  .am-form-group input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #E8E4DC;
    border-radius: 10px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .am-form-group input:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .am-form-group input:disabled { background: #F0EDE6; color: #AAA; cursor: not-allowed; }
  .am-form-note { font-size: 11px; color: #BBB; margin-top: 4px; }

  .am-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .am-btn-save {
    flex: 1; padding: 13px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(201,123,46,0.28);
  }
  .am-btn-save:hover:not(:disabled) { background: #B56E25; }
  .am-btn-save:disabled { opacity: 0.7; cursor: wait; }
  .am-btn-cancel {
    padding: 13px 20px;
    background: #F0EDE6; color: #555;
    border: 1px solid #E2DDD5; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .am-btn-cancel:hover { background: #E8E4DC; }

  /* TOAST */
  .am-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999; transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .am-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .am-toast.success { background: #2E7D52; }
  .am-toast.error   { background: #C0392B; }

  /* CONFIRM DIALOG */
  .am-confirm-box {
    background: #fff; border-radius: 14px; padding: 28px;
    width: 100%; max-width: 360px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    border: 1px solid #ECEAE4;
    animation: am-modal-in 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .am-confirm-box h3 { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1A1A1A; margin-bottom: 8px; }
  .am-confirm-box p  { font-size: 13px; color: #777; margin-bottom: 20px; }
  .am-confirm-actions { display: flex; gap: 10px; }
  .am-btn-danger {
    flex: 1; padding: 11px;
    background: #ef4444; color: #fff;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .am-btn-danger:hover { background: #dc2626; }
`;

const blankAdd  = { ad_id: "", ad_name: "", password: "" };
const blankEdit = { password: "" };

export default function AdminManagement() {
  const navigate = useNavigate();

  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searchId, setSearchId] = useState("");

  const [addModal,      setAddModal]      = useState(false);
  const [addForm,       setAddForm]       = useState(blankAdd);
  const [editModal,     setEditModal]     = useState(null);   // ad_id | null
  const [editForm,      setEditForm]      = useState(blankEdit);
  const [deleteTarget,  setDeleteTarget]  = useState(null);   // admin object | null
  const [saving,        setSaving]        = useState(false);

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAdmins = async (query = "") => {
    setLoading(true);
    let q = supabase.from("admin").select("*").order("ad_id");
    if (query.trim()) q = q.ilike("ad_id", `%${query.trim()}%`);
    const { data, error } = await q;
    if (!error) setAdmins(data || []);
    else showToast("Failed to load admins", "error");
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = () => fetchAdmins(searchId);
  const handleSearchKey = (e) => { if (e.key === "Enter") handleSearch(); };

  // ── Add ────────────────────────────────────────────────────────────────────
  const saveAdd = async () => {
    const { ad_id, ad_name, password } = addForm;
    if (!ad_id.trim() || !ad_name.trim() || !password.trim()) {
      showToast("All fields are required", "error"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("admin").insert({ ad_id, ad_name, password });
    setSaving(false);
    if (error) { showToast("Failed to add admin", "error"); return; }
    showToast("Admin added successfully");
    setAddModal(false);
    setAddForm(blankAdd);
    fetchAdmins(searchId);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (a) => {
    setEditModal(a.ad_id);
    setEditForm({ password: a.password });
  };

  const saveEdit = async () => {
    if (!editForm.password.trim()) {
      showToast("Password cannot be empty", "error"); return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("admin")
      .update({ password: editForm.password })
      .eq("ad_id", editModal);
    setSaving(false);
    if (error) { showToast("Update failed", "error"); return; }
    showToast("Password updated");
    setEditModal(null);
    fetchAdmins(searchId);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("admin")
      .delete()
      .eq("ad_id", deleteTarget.ad_id);
    setSaving(false);
    if (error) { showToast("Delete failed", "error"); return; }
    showToast("Admin removed");
    setDeleteTarget(null);
    fetchAdmins(searchId);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="am-wrapper">

        {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
        <nav className="am-nav">
          <div className="am-brand">
            <div className="am-logo">DT</div>
            <div className="am-brand-text">
              <h1>Admin Panel</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="am-nav-actions">
            <button className="am-back" onClick={() => navigate("/admin-dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <button className="am-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
        <main className="am-main">

          {/* Header */}
          <div className="am-header">
            <div className="am-header-label"><span>Admin Management</span></div>
            <h2>Manage <em>Admins</em></h2>
            <p>Search, add, and update admin accounts for the assessment portal.</p>
          </div>

          {/* Search + Add */}
          <div className="am-card">
            <div className="am-card-title">Search</div>
            <div className="am-search-row">
              <div className="am-search-wrap">
                <svg className="am-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="am-search-input"
                  placeholder="Search by Admin ID…"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </div>
              <button className="am-search-btn" onClick={handleSearch}>Search</button>
              <button className="am-add-btn" onClick={() => setAddModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Admin
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="am-card">
            <div className="am-card-title" style={{ justifyContent: "space-between" }}>
              <span>Admins</span>
              {!loading && (
                <span className="am-count-badge">
                  {admins.length} {admins.length === 1 ? "admin" : "admins"}
                </span>
              )}
            </div>

            {loading ? (
              <div className="am-loading">Loading admins…</div>
            ) : admins.length === 0 ? (
              <div className="am-empty">
                <div className="am-empty-icon">🔍</div>
                No admins found
              </div>
            ) : (
              <div className="am-table-wrap">
                <table className="am-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Admin ID</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((a, i) => (
                      <tr key={a.ad_id}>
                        <td style={{ color: "#AAA", fontSize: 13 }}>{i + 1}</td>
                        <td><span className="am-id-badge">{a.ad_id}</span></td>
                        <td style={{ fontWeight: 500 }}>{a.ad_name}</td>
                        <td>
                          <div className="am-action-group">
                            <button className="am-edit-btn" onClick={() => openEdit(a)}>
                              ✏️ Edit Password
                            </button>
                            <button className="am-delete-btn" onClick={() => setDeleteTarget(a)}>
                              🗑️ Delete
                            </button>
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

      {/* ══ ADD MODAL ═══════════════════════════════════════════════════════════ */}
      {addModal && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div className="am-modal">
            <div className="am-modal-header">
              <div className="am-modal-title">Add <em>Admin</em></div>
              <button className="am-modal-close" onClick={() => setAddModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="am-form-group">
              <label>Admin ID</label>
              <input
                type="text"
                placeholder="e.g. ADMIN001"
                value={addForm.ad_id}
                onChange={e => setAddForm(f => ({ ...f, ad_id: e.target.value }))}
              />
            </div>

            <div className="am-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter admin name"
                value={addForm.ad_name}
                onChange={e => setAddForm(f => ({ ...f, ad_name: e.target.value }))}
              />
            </div>

            <div className="am-form-group">
              <label>Password</label>
              <input
                type="text"
                placeholder="Set a password"
                value={addForm.password}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={() => { setAddModal(false); setAddForm(blankAdd); }}>Cancel</button>
              <button className="am-btn-save" onClick={saveAdd} disabled={saving}>
                {saving ? "Adding…" : "➕ Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════════ */}
      {editModal && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div className="am-modal">
            <div className="am-modal-header">
              <div>
                <div className="am-modal-title">Edit <em>Password</em></div>
                <div className="am-modal-subtitle">Admin ID: {editModal} (read-only)</div>
              </div>
              <button className="am-modal-close" onClick={() => setEditModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="am-form-group">
              <label>Admin ID</label>
              <input type="text" value={editModal} disabled />
              <div className="am-form-note">Admin ID cannot be changed</div>
            </div>

            <div className="am-form-group">
              <label>New Password</label>
              <input
                type="text"
                placeholder="Enter new password"
                value={editForm.password}
                onChange={e => setEditForm({ password: e.target.value })}
              />
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="am-btn-save" onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ═══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="am-confirm-box">
            <h3>Delete Admin?</h3>
            <p>
              This will permanently remove <strong>{deleteTarget.ad_name || deleteTarget.ad_id}</strong>{" "}
              (<span style={{ fontFamily: "monospace", color: "#C97B2E" }}>{deleteTarget.ad_id}</span>) from the system.
              This action cannot be undone.
            </p>
            <div className="am-confirm-actions">
              <button className="am-btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="am-btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? "Deleting…" : "🗑️ Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ════════════════════════════════════════════════════════════════ */}
      <div className={`am-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}