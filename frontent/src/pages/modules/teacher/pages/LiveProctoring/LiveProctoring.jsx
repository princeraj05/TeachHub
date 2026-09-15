import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FaTv,
  FaVideo,
  FaDesktop,
  FaUser,
  FaExpand,
  FaCompress,
  FaSignal,
  FaExclamationCircle,
  FaCalendarAlt,
  FaPlayCircle,
  FaThLarge,
  FaArrowLeft,
  FaEye
} from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function LiveProctoring() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "single"
  const [fullscreenFeed, setFullscreenFeed] = useState(null); // 'camera' | 'screen' | null

  // Real-time candidate frames dictionary keyed by student ID:
  // { [studentId]: { cameraFrame, screenFrame, isLive: boolean } }
  const [candidateFrames, setCandidateFrames] = useState({});

  const socketRef = useRef(null);

  const fetchSessions = () => {
    setLoading(true);
    axios
      .get(`${API}/api/teacher/proctor-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSessions(res.data || []);
      })
      .catch((err) => console.error("Error fetching proctor sessions", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();

    // Establish Socket connection
    socketRef.current = io(API, {
      auth: { token }
    });

    // Realtime events
    socketRef.current.on("student-test-started", ({ studentId, studentName }) => {
      setCandidateFrames(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], isLive: true }
      }));
      fetchSessions();
    });

    socketRef.current.on("student-test-stopped", ({ studentId }) => {
      setCandidateFrames(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          isLive: false,
          cameraFrame: null,
          screenFrame: null
        }
      }));
      fetchSessions();
    });

    socketRef.current.on("proctor-signal", ({ senderId, signal }) => {
      setCandidateFrames(prev => {
        const existing = prev[senderId] || { isLive: true };
        if (signal.type === "camera-frame") {
          return {
            ...prev,
            [senderId]: { ...existing, cameraFrame: signal.frame, isLive: true }
          };
        } else if (signal.type === "screen-frame") {
          return {
            ...prev,
            [senderId]: { ...existing, screenFrame: signal.frame, isLive: true }
          };
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const openSingleStudentView = (student) => {
    setSelectedStudent(student);
    setViewMode("single");
    setFullscreenFeed(null);
  };

  const backToGridView = () => {
    setSelectedStudent(null);
    setViewMode("grid");
    setFullscreenFeed(null);
  };

  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: SORA }}>
      
      {/* Top Header & Layout Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0B132A] p-4 sm:p-5 rounded-2.5xl sm:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              Live Exam Proctoring
            </h2>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full border border-purple-500/20">
              {sessions.length} Candidate{sessions.length !== 1 ? "s" : ""} Total
            </span>
          </div>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-medium">
            Monitor and supervise student webcam and screen share streams in real time.
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/50 dark:border-white/5 select-none">
            <button
              onClick={backToGridView}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FaThLarge className="text-xs" /> Grid View ({sessions.length})
            </button>
            {selectedStudent && (
              <button
                onClick={() => setViewMode("single")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  viewMode === "single"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FaUser className="text-xs" /> Focus: {selectedStudent.name}
              </button>
            )}
          </div>

          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-650 dark:text-slate-350 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap"
          >
            Refresh Roster
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0B132A] rounded-3xl p-16 text-center border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-xs font-bold">Loading active exam roster...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white dark:bg-[#0B132A] rounded-3xl p-16 text-center border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-xl">
            <FaSignal />
          </div>
          <h4 className="text-base font-black text-slate-800 dark:text-white">No Active Candidates Scheduled</h4>
          <p className="text-xs text-slate-400 font-medium max-w-sm">
            There are currently no active students scheduled for live proctoring.
          </p>
        </div>
      ) : viewMode === "grid" ? (

        /* ================= GRID VIEW (ALL 4 CANDIDATES) ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">
              Multi-Student Live Stream Grid ({sessions.length} Candidates)
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-extrabold">
              Click any candidate to inspect full screen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((s) => {
              const frames = candidateFrames[s._id] || {};
              const isLive = frames.isLive || false;
              const camFrame = frames.cameraFrame || null;
              const scrFrame = frames.screenFrame || null;

              const initials = s.name
                ? s.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                : "U";

              return (
                <div
                  key={s._id}
                  className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Candidate Info Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {s.name}
                          </h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                            s.isClassExam
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                          }`}>
                            {s.isClassExam ? "Class Exam" : "Admission"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                          {s.isClassExam ? `${s.examName} (${s.class})` : s.email}
                        </p>
                      </div>
                    </div>

                    {/* Live Status Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-rose-500 animate-ping" : "bg-slate-300 dark:bg-slate-700"}`} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isLive ? "text-rose-500" : "text-slate-400"}`}>
                        {isLive ? "Live Streaming" : "Waiting"}
                      </span>
                    </div>
                  </div>

                  {/* Dual Stream Windows (Camera & Screen Share) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Webcam Mini Card */}
                    <div className="bg-slate-950 dark:bg-black rounded-2xl aspect-video relative flex items-center justify-center overflow-hidden border border-slate-800">
                      {camFrame ? (
                        <img
                          src={camFrame}
                          alt={`${s.name} Camera`}
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-500 flex flex-col items-center gap-1">
                          <FaVideo className="text-base text-slate-700 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Camera</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-bold text-white flex items-center gap-1">
                        <FaVideo className="text-teal-400 text-[8px]" /> Webcam
                      </div>
                    </div>

                    {/* Screen Share Mini Card */}
                    <div className="bg-slate-950 dark:bg-black rounded-2xl aspect-video relative flex items-center justify-center overflow-hidden border border-slate-800">
                      {scrFrame ? (
                        <img
                          src={scrFrame}
                          alt={`${s.name} Screen`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-500 flex flex-col items-center gap-1">
                          <FaDesktop className="text-base text-slate-700 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Screen Share</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-bold text-white flex items-center gap-1">
                        <FaDesktop className="text-teal-400 text-[8px]" /> Screen
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <button
                    onClick={() => openSingleStudentView(s)}
                    className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 text-purple-600 hover:text-white dark:text-purple-400 dark:hover:text-white border border-purple-500/20 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaEye className="text-xs" /> Inspect Candidate ({s.name})
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      ) : (

        /* ================= SINGLE CANDIDATE DETAILED FOCUS VIEW ================= */
        <div className="bg-white dark:bg-[#0B132A] rounded-2.5xl sm:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-4 sm:p-6 space-y-6">
          
          {/* Header with Back Button & Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-white/5 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={backToGridView}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition cursor-pointer"
              >
                <FaArrowLeft /> Back to Grid View
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <FaUser className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-850 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <FaCalendarAlt /> 
                    {selectedStudent.isClassExam 
                      ? `Class Exam: ${selectedStudent.examName} (${selectedStudent.class})` 
                      : "Admission Exam"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                candidateFrames[selectedStudent._id]?.isLive ? "bg-rose-500 animate-ping" : "bg-slate-300"
              }`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                candidateFrames[selectedStudent._id]?.isLive ? "text-rose-500" : "text-slate-400"
              }`}>
                {candidateFrames[selectedStudent._id]?.isLive ? "Live Streaming" : "Waiting for Live Stream"}
              </span>
            </div>
          </div>

          {/* Full Feeds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Webcam Feed */}
            {(fullscreenFeed === null || fullscreenFeed === "camera") && (
              <div className={`bg-slate-950 dark:bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-md relative group flex flex-col justify-center min-h-[300px] ${
                fullscreenFeed === "camera" ? "md:col-span-2 min-h-[500px]" : ""
              }`}>
                {candidateFrames[selectedStudent._id]?.cameraFrame ? (
                  <img
                    src={candidateFrames[selectedStudent._id].cameraFrame}
                    alt="Webcam Feed"
                    className="w-full h-full object-contain scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2">
                    <FaVideo className="text-4xl text-slate-700 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Camera Feed initializing...</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-white text-[10px] font-bold">
                  <FaVideo className="text-teal-400" /> Candidate Webcam
                </div>
                <button
                  onClick={() => setFullscreenFeed(fullscreenFeed === "camera" ? null : "camera")}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl cursor-pointer transition opacity-0 group-hover:opacity-100"
                >
                  {fullscreenFeed === "camera" ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            )}

            {/* Screen Share Feed */}
            {(fullscreenFeed === null || fullscreenFeed === "screen") && (
              <div className={`bg-slate-950 dark:bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-md relative group flex flex-col justify-center min-h-[300px] ${
                fullscreenFeed === "screen" ? "md:col-span-2 min-h-[500px]" : ""
              }`}>
                {candidateFrames[selectedStudent._id]?.screenFrame ? (
                  <img
                    src={candidateFrames[selectedStudent._id].screenFrame}
                    alt="Screen Share Feed"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2">
                    <FaDesktop className="text-4xl text-slate-700 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Screen Share initializing...</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-white text-[10px] font-bold">
                  <FaDesktop className="text-teal-400" /> Candidate Desktop Screen
                </div>
                <button
                  onClick={() => setFullscreenFeed(fullscreenFeed === "screen" ? null : "screen")}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl cursor-pointer transition opacity-0 group-hover:opacity-100"
                >
                  {fullscreenFeed === "screen" ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveProctoring;
