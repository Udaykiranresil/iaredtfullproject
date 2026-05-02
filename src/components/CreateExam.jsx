import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ce-wrapper {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F3EE;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
  }

  .ce-card {
    background: #FFFFFF;
    border: 1px solid #ECEAE4;
    border-radius: 18px;
    padding: 40px 40px 36px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    width: 100%; max-width: 520px;
  }

  .ce-label {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  }
  .ce-label::before {
    content: ''; width: 3px; height: 16px;
    background: #C97B2E; border-radius: 2px;
  }
  .ce-label span {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase; color: #AAA;
  }

  .ce-card h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; font-weight: 400;
    color: #1A1A1A; margin-bottom: 6px;
  }
  .ce-card h2 em { font-style: italic; color: #C97B2E; }
  .ce-card > p { font-size: 13px; color: #888; margin-bottom: 28px; }

  .ce-field { margin-bottom: 16px; }
  .ce-field label {
    display: block;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.8px; text-transform: uppercase;
    color: #666; margin-bottom: 7px;
  }
  .ce-input, .ce-select {
    width: 100%;
    padding: 13px 14px;
    border: 1.5px solid #E8E4DC;
    border-radius: 12px;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #1A1A1A; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }
  .ce-input::placeholder { color: #BBB; }
  .ce-input:focus, .ce-select:focus {
    border-color: #C97B2E;
    box-shadow: 0 0 0 3px rgba(201,123,46,0.12);
    background: #FFF;
  }
  .ce-select { cursor: pointer; }

  .ce-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .ce-btn {
    width: 100%; padding: 15px;
    background: #C97B2E; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 8px;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(201,123,46,0.30);
  }
  .ce-btn:hover { background: #B56E25; }
  .ce-btn:active { transform: scale(0.99); }
  .ce-btn:disabled { opacity: 0.7; cursor: wait; }

  .ce-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none;
    font-size: 13px; color: #888; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 20px;
    padding: 0;
  }
  .ce-back:hover { color: #C97B2E; }

  /* TOAST */
  .ce-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 500; color: #fff;
    z-index: 999;
    transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s;
    opacity: 0; pointer-events: none; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .ce-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  .ce-toast.success { background: #2E7D52; }
  .ce-toast.error   { background: #C0392B; }
  .ce-select:disabled { background: #eee; cursor: not-allowed; opacity: 0.6; }
`;

export default function CreateExam() {
    const navigate = useNavigate();
    const [examName, setExamName] = useState("");
    const [sem, setSem] = useState("");
    const [branch, setBranch] = useState("");
    const [section, setSection] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

    const [semList, setSemList] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [showSubjects, setShowSubjects] = useState(false);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".ce-field")) {
                setShowSubjects(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);
    const user = JSON.parse(localStorage.getItem("user"));

    const showToast = (msg, type) => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: semData } = await supabase.from("semesters").select("*");
        const { data: branchData } = await supabase.from("branches").select("*");
        const { data: subjectData } = await supabase.from("subjects").select("*");
        setSemList(semData || []);
        setBranchList(branchData || []);
        setSubjectList(subjectData || []);
    };
    const handleCreate = async () => {
        if (!examName || !sem || !branch || !section || !subjects.length || !startTime || !duration) {
            showToast("Please fill all fields", "error");
            return;
        }

        setLoading(true);

        const endTime = new Date(
            new Date(startTime).getTime() + parseInt(duration) * 60000
        ).toISOString();

        // 1. Fetch students once
        const { data: students, error: stuError } = await supabase
            .from("student")
            .select("st_id")
            .eq("sem_id", parseInt(sem))
            .eq("branch_id", parseInt(branch))
            .eq("section", parseInt(section));

        if (stuError || !students?.length) {
            setLoading(false);
            showToast("No matching students found", "error");
            return;
        }

        const generateKey = () =>
            Math.random().toString(36).substring(2, 8).toUpperCase();
        // 🔹 Generate ONE key per student
        const keyMap = {};

        students.forEach((s) => {
            keyMap[s.st_id] = generateKey();
        });

        // 2. LOOP through selected subjects
        for (let sub of subjects) {

            // 🧹 Delete exam_keys for any EXPIRED past exams of this subject/sem/branch/section
            const now = new Date().toISOString();
            const { data: expiredExams } = await supabase
                .from("conduct_exam")
                .select("exam_id")
                .eq("sem_id", parseInt(sem))
                .eq("branch_id", parseInt(branch))
                .eq("section", parseInt(section))
                .eq("subject_id", parseInt(sub))
                .lt("end_time", now); // only exams whose end_time has passed

            if (expiredExams && expiredExams.length > 0) {
                const expiredIds = expiredExams.map((e) => e.exam_id);
                await supabase
                    .from("exam_keys")
                    .delete()
                    .in("exam_id", expiredIds);
            }

            // 🔹 Create exam for each subject
            const { data: examData, error: examError } = await supabase
                .from("conduct_exam")
                .insert([{
                    exam_name: examName,
                    sem_id: parseInt(sem),
                    branch_id: parseInt(branch),
                    section: parseInt(section),
                    subject_id: parseInt(sub),
                    start_time: new Date(startTime).toISOString(),
                    end_time: endTime,
                    duration_minutes: parseInt(duration),
                    ad_id: user.ad_id,
                }])
                .select()
                .single();

            if (examError) {
                console.error("Exam error:", examError);
                continue; // skip this subject, continue others
            }

            const exam_id = examData.exam_id;

            const keyRows = students.map((s) => ({
                exam_id,
                st_id: s.st_id,
                exam_key: keyMap[s.st_id], // 🔥 same key reused
                is_used: false,
            }));

            await supabase.from("exam_keys").insert(keyRows);
        }

        setLoading(false);
        showToast(`Exams created for ${subjects.length} subjects`, "success");
        setTimeout(() => navigate("/admin-dashboard"), 1500);
    };

    return (
        <>
            <style>{styles}</style>
            <div className="ce-wrapper">
                <div style={{ width: "100%", maxWidth: "520px" }}>
                    <button className="ce-back" onClick={() => navigate("/admin-dashboard")}>
                        ← Back to Dashboard
                    </button>

                    <div className="ce-card">
                        <div className="ce-label"><span>Admin</span></div>
                        <h2>Create New <em>Exam</em></h2>
                        <p>Configure the exam details below. Students will be matched by semester, branch, and section.</p>

                        <div className="ce-field">
                            <label>Exam Name</label>
                            <select
                                className="ce-select"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                            >
                                <option value="">Select Exam</option>
                                <option value="DT 1">DT 1</option>
                                <option value="DT 2">DT 2</option>
                            </select>
                        </div>

                        <div className="ce-row">
                            <div className="ce-field">
                                <label>Semester</label>
                                <select className="ce-select" value={sem} onChange={(e) => {
                                    setSem(e.target.value);
                                    setBranch("");
                                    setSubjects([]);
                                }}>
                                    <option value="">Select Semester</option>
                                    {semList.map((s) => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="ce-field">
                                <label>Branch</label>
                                <select
                                    className="ce-select"
                                    value={branch}
                                    disabled={!sem}   // 🔴 disabled until semester selected
                                    onChange={(e) => {
                                        setBranch(e.target.value);
                                        setSubjects([]); // reset subject
                                    }}
                                >
                                    <option value="">Select Branch</option>

                                    {branchList
                                        .filter(b => b.semester_id === parseInt(sem))
                                        .map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.label}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="ce-row">
                            <div className="ce-field">
                                <label>Subject</label>

                                <div style={{ position: "relative" }}>
                                    {/* Trigger */}
                                    <div
                                        className="ce-select"
                                        style={{ opacity: !branch ? 0.6 : 1, cursor: !branch ? "not-allowed" : "pointer" }}
                                        onClick={() => branch && setShowSubjects(!showSubjects)}
                                    >
                                        {subjects.length
                                            ? `${subjects.length} selected`
                                            : "Select Subjects"}
                                    </div>

                                    {/* Dropdown */}
                                    {showSubjects && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                right: 0,
                                                background: "#fff",
                                                border: "1px solid #E8E4DC",
                                                borderRadius: "12px",
                                                padding: "10px",
                                                maxHeight: "180px",
                                                overflowY: "auto",
                                                zIndex: 10,
                                            }}
                                        >
                                            {subjectList
                                                .filter(s =>
                                                    s.branch_id === parseInt(branch) &&
                                                    s.sem_id === parseInt(sem)
                                                )
                                                .map((s) => (
                                                    <label
                                                        key={s.id}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                            padding: "6px 4px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={subjects.includes(String(s.id))}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSubjects([...subjects, String(s.id)]);
                                                                } else {
                                                                    setSubjects(subjects.filter(id => id !== String(s.id)));
                                                                }
                                                            }}
                                                        />
                                                        {s.label}
                                                    </label>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="ce-field">
                                <label>Section</label>
                                <input
                                    className="ce-input"
                                    type="number"
                                    placeholder="e.g. 1, 2, 3"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    min="1"
                                />
                            </div>


                        </div>
                        <div className="ce-row">
                            <div className="ce-field">
                                <label>Duration (minutes)</label>
                                <input
                                    className="ce-input"
                                    type="number"
                                    placeholder="e.g. 60"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    min="1"
                                />
                            </div>
                            <div className="ce-field">
                                <label>Start Time</label>
                                <input
                                    className="ce-input"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>


                        <button className="ce-btn" onClick={handleCreate} disabled={loading}>
                            {loading ? "Creating…" : "Create Exam →"}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`ce-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
        </>
    );
}