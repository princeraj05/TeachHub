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
  FaPlayCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function LiveProctoring() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Real-time frames
  const [cameraFrame, setCameraFrame] = useState(null);
  const [screenFrame, setScreenFrame] = useState(null);
  const [isStudentLive, setIsStudentLive] = useState(false);
  const [fullscreenFeed, setFullscreenFeed] = useState(null); // 'camera' | 'screen' | null

  const socketRef = useRef(null);

  const fetchSessions = () => {
    setLoading(true);
    axios
      .get(`${API}/api/teacher/proctor-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSessions(res.data);
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
      setIsStudentLive(true);
      // Automatically select if none selected
      setSelectedStudent(prev => {
        if (!prev) {
          return { _id: studentId, name: studentName };
        }
        return prev;
      });
      fetchSessions();
    });

    socketRef.current.on("student-test-stopped", ({ studentId }) => {
      setIsStudentLive(false);
      setCameraFrame(null);
      setScreenFrame(null);
      fetchSessions();
    });

    socketRef.current.on("proctor-signal", ({ senderId, signal }) => {
      setIsStudentLive(true);
      if (signal.type === "camera-frame") {
        setCameraFrame(signal.frame);
      } else if (signal.type === "screen-frame") {
        setScreenFrame(signal.frame);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setCameraFrame(null);
    setScreenFrame(null);
    setIsStudentLive(false);
    setFullscreenFeed(null);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: SORA }}>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Entrance Exam live Proctoring
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-medium">
            Monitor and supervise student candidates taking their admission entrance tests.
          </p>
        </div>
        <button
          onClick={fetchSessions}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-650 dark:text-slate-350 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Refresh Roster
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Candidates List (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-3 px-1">
              Active Candidates
            </h3>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-450">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                No active exam sessions scheduled.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => {
                  const isSelected = selectedStudent && selectedStudent._id === s._id;
                  const initials = s.name
                    ? s.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                    : "U";

                  return (
                    <button
                      key={s._id}
                      onClick={() => selectStudent(s)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#7C3AED]/5 dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 text-slate-900 dark:text-white"
                          : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-white shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Streaming Canvas (3 cols) */}
        <div className="lg:col-span-3">
          {selectedStudent ? (
            <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-6 space-y-6">
              {/* Active Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-white/5 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <FaUser className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <FaCalendarAlt /> 
                      {selectedStudent.admissionExamDate ? new Date(selectedStudent.admissionExamDate).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isStudentLive ? "bg-rose-500 animate-ping" : "bg-slate-300"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isStudentLive ? "text-rose-550 dark:text-rose-400" : "text-slate-400"}`}>
                    {isStudentLive ? "Live Streaming" : "Waiting for Student to Join"}
                  </span>
                </div>
              </div>

              {/* Live Feeds Grid */}
              <div className="relative">
                {isStudentLive ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Webcam Feed Card */}
                    {(fullscreenFeed === null || fullscreenFeed === "camera") && (
                      <div className={`bg-slate-900 dark:bg-black rounded-2xl overflow-hidden border border-slate-850 shadow-md relative group flex flex-col justify-center min-h-[260px] ${fullscreenFeed === "camera" ? "md:col-span-2 min-h-[450px]" : ""}`}>
                        {cameraFrame ? (
                          <img
                            src={cameraFrame}
                            alt="Webcam Feed"
                            className="w-full h-full object-contain scale-x-[-1]"
                          />
                        ) : (
                          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                            <FaVideo className="text-3xl text-slate-700 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Camera Feed initializing...</span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-white text-[10px] font-bold">
                          <FaVideo className="text-teal-400" /> Webcam Feed
                        </div>
                        <button
                          onClick={() => setFullscreenFeed(fullscreenFeed === "camera" ? null : "camera")}
                          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl cursor-pointer transition opacity-0 group-hover:opacity-100"
                        >
                          {fullscreenFeed === "camera" ? <FaCompress /> : <FaExpand />}
                        </button>
                      </div>
                    )}

                    {/* Screen Share Feed Card */}
                    {(fullscreenFeed === null || fullscreenFeed === "screen") && (
                      <div className={`bg-slate-900 dark:bg-black rounded-2xl overflow-hidden border border-slate-850 shadow-md relative group flex flex-col justify-center min-h-[260px] ${fullscreenFeed === "screen" ? "md:col-span-2 min-h-[450px]" : ""}`}>
                        {screenFrame ? (
                          <img
                            src={screenFrame}
                            alt="Screen Share Feed"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                            <FaDesktop className="text-3xl text-slate-700 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Screen Share initializing...</span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-white text-[10px] font-bold">
                          <FaDesktop className="text-teal-400" /> Candidate Screen
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
                ) : (
                  <div className="py-24 bg-slate-50 dark:bg-[#1E293B]/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 animate-bounce">
                      <FaSignal className="text-2xl" />
                    </div>
                    <h4 className="text-sm font-black text-slate-750 dark:text-slate-350">
                      Waiting for Student Live Stream
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-xs mt-1">
                      As soon as {selectedStudent.name} begins their exam, their camera and screen streams will display here automatically in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-sm text-center p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                <FaPlayCircle className="text-3xl" />
              </div>
              <h4 className="text-sm font-black text-slate-750 dark:text-slate-350">
                Select a Candidate
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-xs mt-1">
                Choose a candidate from the roster on the left side to monitor their entrance examination feeds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveProctoring;
