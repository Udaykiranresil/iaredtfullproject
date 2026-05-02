import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from "../supabase";

const IconSun = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)
const IconMoon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)
const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)
const SUBJECT_ICONS = [
    (<span>➕</span>),
    (<span>🗄️</span>),
    (<span>🖥️</span>),
    (<span>🌐</span>)
];

function Toast({ msg, onDone }) {
    useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
    return (
        <div style={{
            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            background: '#1e1b4b', color: '#fff', padding: '12px 22px', borderRadius: 14,
            fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
            animation: 'slideUp 0.3s ease',
        }}>
            <span style={{ color: '#f59e0b' }}>⚡</span>{msg}
        </div>
    )
}

function InfoCard({ icon, value, sub, dark }) {
    const [h, setH] = useState(false)
    return (
        <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
            borderRadius: 20, padding: '20px 22px',
            border: `1px solid ${dark ? (h ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)') : (h ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.07)')}`,
            background: dark ? 'rgba(22,20,50,0.85)' : '#fff',
            boxShadow: dark ? (h ? '0 8px 28px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.25)') : (h ? '0 8px 28px rgba(67,56,202,0.1)' : '0 2px 12px rgba(0,0,0,0.05)'),
            transform: h ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
            backdropFilter: 'blur(12px)', fontFamily: "'DM Sans',sans-serif",
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}>{icon}</div>
            <p style={{ fontSize: 22, fontWeight: 700, color: dark ? '#f1f0ff' : '#1e1b4b', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, fontWeight: 500, color: dark ? 'rgba(165,180,252,0.45)' : 'rgba(107,114,128,0.8)', letterSpacing: '0.3px' }}>{sub}</p>
        </div>
    )
}

function SubjectCard({ subject, index, dark, onClick }) {
    const [h, setH] = useState(false)
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{
                position: 'relative', overflow: 'hidden', borderRadius: 20, cursor: 'pointer', padding: '24px',
                border: `1px solid ${dark ? (h ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)') : (h ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.07)')}`,
                background: dark ? (h ? 'rgba(30,27,60,0.95)' : 'rgba(22,20,50,0.85)') : (h ? '#ffffff' : '#f9f9fb'),
                boxShadow: dark ? (h ? '0 12px 40px rgba(0,0,0,0.45)' : '0 2px 16px rgba(0,0,0,0.3)') : (h ? '0 8px 32px rgba(67,56,202,0.12)' : '0 2px 12px rgba(0,0,0,0.06)'),
                transform: h ? 'translateY(-4px) scale(1.015)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                fontFamily: "'DM Sans',sans-serif",
            }}
        >
            <div style={{ position: 'absolute', top: -24, right: -24, width: 96, height: 96, borderRadius: '50%', background: subject.corner }} />
            <div style={{ width: 48, height: 48, borderRadius: 14, background: subject.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                {subject.icon}
            </div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(99,102,241,0.5)', marginBottom: 6 }}>
                Subject {String(index + 1).padStart(2, '0')}
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: dark ? '#f1f0ff' : '#1e1b4b', marginBottom: 16, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                {subject.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(99,102,241,0.5)' }}>Available</span>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: subject.bar, transform: h ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s ease', borderRadius: '0 0 20px 20px' }} />
        </div>
    )
}

function ScoreBar({ pct, dark }) {
    const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                flex: 1, height: 6, borderRadius: 999,
                background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32, textAlign: 'right' }}>{Math.round(pct)}%</span>
        </div>
    )
}

function StatCard({ label, value, sub, dark, accent }) {
    return (
        <div style={{
            borderRadius: 16, padding: '18px 20px',
            background: dark ? 'rgba(22,20,50,0.85)' : '#fff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.05)',
            fontFamily: "'DM Sans',sans-serif",
        }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(107,114,128,0.7)', marginBottom: 10 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: accent || (dark ? '#f1f0ff' : '#1e1b4b'), letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: 12, color: dark ? 'rgba(165,180,252,0.4)' : 'rgba(107,114,128,0.6)', marginTop: 6 }}>{sub}</p>}
        </div>
    )
}

function AnalyticsRow({ exam, subject, marks, matchPct, status, dark, index }) {
    const isAttended = status === 'attended'
    const rowBg = dark
        ? (index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
        : (index % 2 === 0 ? 'rgba(99,102,241,0.025)' : 'transparent')

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1fr 120px',
            gap: 12, alignItems: 'center', padding: '13px 20px',
            background: rowBg,
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
            fontFamily: "'DM Sans',sans-serif",
            opacity: isAttended ? 1 : 0.65,
        }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: dark ? '#e2e0ff' : '#1e1b4b' }}>{exam}</span>
            <span style={{ fontSize: 13, color: dark ? 'rgba(165,180,252,0.6)' : '#6b7280' }}>{subject}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: dark ? '#f1f0ff' : '#1e1b4b' }}>
                {isAttended ? marks : <span style={{ color: dark ? 'rgba(165,180,252,0.3)' : '#d1d5db' }}>—</span>}
            </span>
            <div>
                {isAttended
                    ? <ScoreBar pct={matchPct} dark={dark} />
                    : <span style={{ fontSize: 12, color: dark ? 'rgba(165,180,252,0.3)' : '#d1d5db' }}>—</span>}
            </div>
            <div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: isAttended
                        ? (dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)')
                        : (dark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)'),
                    color: isAttended ? '#10b981' : '#ef4444',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAttended ? '#10b981' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                    {isAttended ? 'Completed' : 'Missed'}
                </span>
            </div>
        </div>
    )
}

function SectionHeader({ label, count, color, dark }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px 8px',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.55)' : 'rgba(107,114,128,0.7)', fontFamily: "'Space Mono',monospace" }}>{label}</span>
            <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                color: dark ? 'rgba(165,180,252,0.6)' : '#6b7280',
            }}>{count}</span>
        </div>
    )
}

export default function ExamDashboard() {

    const [exams, setExams] = useState([]);
    const navigate = useNavigate()
    const [dark, setDark] = useState(() => {
        const s = localStorage.getItem('dt-theme'); if (s) return s === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })
    const [toast, setToast] = useState(null)
    const [thH, setThH] = useState(false)
    const [loH, setLoH] = useState(false)
    const [activeTab, setActiveTab] = useState("dashboard");
    const [analytics, setAnalytics] = useState([]);
    const [notAttended, setNotAttended] = useState([]);
    const [semLabel, setSemLabel] = useState("");
    const [branchLabel, setBranchLabel] = useState("");

    // ── Ref to hold latest analytics without causing dep-chain re-renders ──
    const analyticsRef = useRef([]);

    const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()

    useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

    // ── Single combined fetch: analytics → exams → notAttended in sequence ──
    // useCallback deps are STABLE (user fields, not state arrays)
    const fetchAllData = useCallback(async () => {
        if (!user) return;
        const now = new Date().toISOString();

        // 1. Fetch analytics first
        const { data: analyticsData, error: analyticsErr } = await supabase
            .from("exam_results")
            .select(`
                total_marks,
                avg_match_pct,
                exam_id,
                conduct_exam (
                    exam_name,
                    subjects ( label )
                )
            `)
            .eq("st_id", user.st_id)
            .order("submitted_at", { ascending: false });

        if (analyticsErr) { console.error("analytics:", analyticsErr); return; }

        const analyticsResult = analyticsData || [];
        analyticsRef.current = analyticsResult;
        setAnalytics(analyticsResult);

        const submittedIds = analyticsResult.map(a => a.exam_id);

        // 🧹 Delete exam_keys for any expired exams belonging to this student
        const { data: expiredExams } = await supabase
            .from("conduct_exam")
            .select("exam_id")
            .eq("sem_id", user.sem_id)
            .eq("branch_id", user.branch_id)
            .eq("section", user.section)
            .lt("end_time", now);

        if (expiredExams && expiredExams.length > 0) {
            const expiredIds = expiredExams.map((e) => e.exam_id);
            await supabase
                .from("exam_keys")
                .delete()
                .in("exam_id", expiredIds)
                .eq("st_id", user.st_id);
        }

        // 2. Fetch active exams (filter out already submitted)
        const { data: activeData, error: activeErr } = await supabase
            .from("conduct_exam")
            .select(`exam_id, exam_name, subject_id, start_time, end_time, subjects (label)`)
            .eq("sem_id", user.sem_id)
            .eq("branch_id", user.branch_id)
            .eq("section", user.section)
            .lte("start_time", now)
            .gte("end_time", now);

        if (activeErr) { console.error("active exams:", activeErr); }
        else {
            setExams((activeData || []).filter(e => !submittedIds.includes(e.exam_id)));
        }

        // 3. Fetch past exams (filter out already submitted)
        const { data: pastData, error: pastErr } = await supabase
            .from("conduct_exam")
            .select(`exam_id, exam_name, end_time, subjects (label)`)
            .eq("sem_id", user.sem_id)
            .eq("branch_id", user.branch_id)
            .eq("section", user.section)
            .lt("end_time", now);

        if (pastErr) { console.error("past exams:", pastErr); }
        else {
            setNotAttended((pastData || []).filter(e => !submittedIds.includes(e.exam_id)));
        }
    }, [user?.st_id, user?.sem_id, user?.branch_id, user?.section]); // ✅ primitive deps only — no arrays

    // ── Labels fetch (runs once) ──
    const fetchLabels = useCallback(async () => {
        if (!user) return;
        const [{ data: semData }, { data: branchData }] = await Promise.all([
            supabase.from("semesters").select("label").eq("id", user.sem_id).single(),
            supabase.from("branches").select("label").eq("id", user.branch_id).single(),
        ]);
        setSemLabel(semData?.label || "—");
        setBranchLabel(branchData?.label || "—");
    }, [user?.sem_id, user?.branch_id]); // ✅ primitive deps only

    // ── Run once on mount ──
    useEffect(() => {
        fetchAllData();
        fetchLabels();
    }, [fetchAllData, fetchLabels]);

    // ── Realtime: re-run full fetch when conduct_exam changes ──
    useEffect(() => {
        const ch = supabase
            .channel("conduct-exam-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "conduct_exam" }, fetchAllData)
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [fetchAllData]);

    const studentId = user?.st_id || user?.roll || '—'
    const studentName = user?.st_name || user?.name || 'Student'
    const section = user?.section || '—'

    if (!user) return null

    // ── Analytics summary stats ──
    const totalExams = analytics.length + notAttended.length
    const attendedCount = analytics.length
    const missedCount = notAttended.length
    const avgMarks = analytics.length
        ? Math.round(analytics.reduce((s, a) => s + (a.total_marks || 0), 0) / analytics.length)
        : 0
    const avgMatch = analytics.length
        ? Math.round(analytics.reduce((s, a) => s + (a.avg_match_pct || 0), 0) / analytics.length)
        : 0

    const page = {
        minHeight: '100vh',
        background: dark
            ? 'radial-gradient(ellipse at 0% 0%,rgba(67,40,120,0.45) 0%,#0d0c1a 50%,rgba(40,20,80,0.3) 100%)'
            : '#f4f3fa',
        fontFamily: "'DM Sans',sans-serif",
        color: dark ? '#f1f0ff' : '#1e1b4b',
        transition: 'background 0.4s ease,color 0.3s ease',
        position: 'relative', overflowX: 'hidden',
    }

    return (
        <div style={page}>
            <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

            {/* Ambient blobs */}
            <div style={{ position: 'fixed', top: -120, left: -120, width: 380, height: 380, borderRadius: '50%', background: dark ? 'rgba(109,40,217,0.25)' : 'rgba(99,102,241,0.12)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: dark ? 'rgba(124,58,237,0.2)' : 'rgba(167,139,250,0.12)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* HEADER */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, background: dark ? 'rgba(13,12,26,0.82)' : 'rgba(244,243,250,0.85)', borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: dark ? 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(245,158,11,0.1))' : 'linear-gradient(135deg,#c97b2e,#e8a030)', border: dark ? '1px solid rgba(245,158,11,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14, color: dark ? '#f59e0b' : '#fff', flexShrink: 0, boxShadow: dark ? '0 0 20px rgba(245,158,11,0.15)' : '0 4px 12px rgba(201,123,46,0.4)' }}>DT</div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#1e1b4b', letterSpacing: '-0.2px' }}>Exam Dashboard</div>
                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.45)' : 'rgba(99,102,241,0.5)', marginTop: 2 }}>Assessment Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => setDark(d => !d)} onMouseEnter={() => setThH(true)} onMouseLeave={() => setThH(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)', background: thH ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: dark ? '#c7d2fe' : '#4b5563', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s ease' }}>
                            {dark ? <IconMoon /> : <IconSun />} <span>{dark ? 'Dark' : 'Light'}</span>
                        </button>
                        <div style={{ width: 1, height: 24, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: dark ? '#e2e0ff' : '#1e1b4b', letterSpacing: '0.5px' }}>{studentId}</span>
                            <span style={{ fontSize: 11, fontWeight: 400, color: dark ? 'rgba(165,180,252,0.55)' : '#6b7280' }}>{studentName}</span>
                        </div>
                        <img
                            src={`https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${studentId}/${studentId}.jpg`}
                            onError={(e) => { e.target.src = "/default-user.png"; }}
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: dark ? '2px solid rgba(245,158,11,0.4)' : '2px solid rgba(201,123,46,0.3)', boxShadow: '0 0 0 2px rgba(201,123,46,0.15)' }}
                        />
                        <button onClick={() => { localStorage.removeItem('user'); navigate('/login') }} onMouseEnter={() => setLoH(true)} onMouseLeave={() => setLoH(false)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 999, border: loH ? '1px solid rgba(239,68,68,0.5)' : (dark ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.15)'), background: loH ? 'rgba(239,68,68,0.12)' : (dark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)'), color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s ease' }}>
                            <IconLogout /><span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px 60px', position: 'relative', zIndex: 1 }}>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    {[
                        { id: 'dashboard', label: 'Dashboard', active: 'linear-gradient(135deg,#c97b2e,#e8a030)' },
                        { id: 'analytics', label: 'Analytics', active: 'linear-gradient(135deg,#6366f1,#7c3aed)' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 600,
                                background: activeTab === tab.id ? tab.active : (dark ? "rgba(255,255,255,0.06)" : "#e5e7eb"),
                                color: activeTab === tab.id ? "#fff" : (dark ? "#c7d2fe" : "#374151"),
                                transition: "all 0.2s ease"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── DASHBOARD TAB ── */}
                {activeTab === "dashboard" && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.1s' }}>
                            {[
                                { icon: '📘', value: semLabel, sub: 'Semester' },
                                { icon: '🏫', value: branchLabel, sub: 'Branch' },
                                { icon: '🧩', value: section, sub: 'Section' },
                            ].map(c => <InfoCard key={c.sub} icon={c.icon} value={c.value} sub={c.sub} dark={dark} />)}
                        </div>

                        <div style={{ height: 1, background: dark ? 'linear-gradient(90deg,rgba(99,102,241,0.2),transparent)' : 'linear-gradient(90deg,rgba(99,102,241,0.12),transparent)', marginBottom: 40 }} />

                        <div style={{ marginBottom: 32, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.25s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#f59e0b,#c97b2e)', flexShrink: 0 }} />
                                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(99,102,241,0.55)' }}>Assessment Center</span>
                            </div>
                            <h2 style={{ fontSize: 38, fontWeight: 800, color: dark ? '#fff' : '#1e1b4b', letterSpacing: '-1px', lineHeight: 1.15 }}>
                                Start Your <em style={{ fontStyle: 'italic', color: '#c97b2e', fontWeight: 700 }}>Exam</em>
                            </h2>
                            <p style={{ marginTop: 10, fontSize: 14, color: dark ? 'rgba(165,180,252,0.55)' : 'rgba(107,114,128,0.85)' }}>
                                Select a subject below to begin your assessment session
                            </p>
                        </div>

                        {exams.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '60px 20px',
                                border: `1px dashed ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                                borderRadius: 20, color: dark ? 'rgba(165,180,252,0.4)' : 'rgba(107,114,128,0.6)',
                                fontFamily: "'DM Sans',sans-serif",
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No active exams right now</p>
                                <p style={{ fontSize: 13 }}>Check back later or contact your instructor</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.35s' }}>
                                {exams.map((exam, i) => {
                                    const subject = exam.subjects;
                                    const dynamicSubject = {
                                        id: exam.exam_id,
                                        name: subject?.label || exam.exam_name,
                                        grad: ['linear-gradient(135deg,#7c3aed,#6d28d9)', 'linear-gradient(135deg,#2563eb,#0891b2)', 'linear-gradient(135deg,#059669,#0d9488)', 'linear-gradient(135deg,#ea580c,#d97706)'][i % 4],
                                        corner: ['rgba(167,139,250,0.18)', 'rgba(147,210,240,0.18)', 'rgba(110,231,183,0.18)', 'rgba(253,186,116,0.18)'][i % 4],
                                        bar: ['linear-gradient(90deg,#7c3aed,#6d28d9)', 'linear-gradient(90deg,#2563eb,#0891b2)', 'linear-gradient(90deg,#059669,#0d9488)', 'linear-gradient(90deg,#ea580c,#d97706)'][i % 4],
                                        icon: SUBJECT_ICONS[i % 4]
                                    };
                                    return (
                                        <SubjectCard
                                            key={exam.exam_id}
                                            subject={dynamicSubject}
                                            index={i}
                                            dark={dark}
                                            onClick={() => {
                                                setToast(`Opening "${dynamicSubject.name}"…`);
                                                navigate(`/exam/${exam.exam_id}`);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── ANALYTICS TAB ── */}
                {activeTab === "analytics" && (
                    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                            <StatCard label="Total exams" value={totalExams} dark={dark} />
                            <StatCard label="Attended" value={attendedCount} dark={dark} accent="#10b981" />
                            <StatCard label="Missed" value={missedCount} dark={dark} accent={missedCount > 0 ? '#ef4444' : undefined} />
                            <StatCard
                                label="Avg marks"
                                value={analytics.length ? `${avgMarks}` : '—'}
                                sub={analytics.length ? `${avgMatch}% avg match` : 'No data yet'}
                                dark={dark}
                                accent="#6366f1"
                            />
                        </div>

                        <div style={{
                            borderRadius: 20,
                            background: dark ? 'rgba(22,20,50,0.85)' : '#fff',
                            border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1fr 120px',
                                gap: 12, padding: '12px 20px',
                                background: dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
                                borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                                fontFamily: "'Space Mono',monospace",
                                fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase',
                                color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(99,102,241,0.55)',
                            }}>
                                <span>Exam</span>
                                <span>Subject</span>
                                <span>Marks</span>
                                <span>Match</span>
                                <span>Status</span>
                            </div>

                            <SectionHeader label="Attended" count={analytics.length} color="#10b981" dark={dark} />

                            {analytics.length === 0 ? (
                                <div style={{ padding: '20px', fontSize: 13, color: dark ? 'rgba(165,180,252,0.4)' : '#9ca3af', fontStyle: 'italic' }}>
                                    No exams attended yet
                                </div>
                            ) : analytics.map((item, i) => (
                                <AnalyticsRow
                                    key={item.exam_id || i}
                                    index={i}
                                    exam={item.conduct_exam?.exam_name || '—'}
                                    subject={item.conduct_exam?.subjects?.label || '—'}
                                    marks={item.total_marks ?? '—'}
                                    matchPct={item.avg_match_pct ?? 0}
                                    status="attended"
                                    dark={dark}
                                />
                            ))}

                            <SectionHeader label="Missed" count={notAttended.length} color="#ef4444" dark={dark} />

                            {notAttended.length === 0 ? (
                                <div style={{ padding: '20px', fontSize: 13, color: dark ? 'rgba(165,180,252,0.4)' : '#9ca3af', fontStyle: 'italic' }}>
                                    No missed exams 🎉
                                </div>
                            ) : notAttended.map((item, i) => (
                                <AnalyticsRow
                                    key={item.exam_id || i}
                                    index={i}
                                    exam={item.exam_name || '—'}
                                    subject={item.subjects?.label || '—'}
                                    marks={null}
                                    matchPct={0}
                                    status="missed"
                                    dark={dark}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: dark ? 'rgba(165,180,252,0.25)' : 'rgba(107,114,128,0.4)', fontFamily: "'DM Sans',sans-serif", animation: 'fadeInUp 0.6s ease both', animationDelay: '0.55s' }}>
                    Each exam session is timed. Ensure a stable connection before starting.
                </p>
            </main>

            {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
        </div>
    )
}