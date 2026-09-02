import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Helper to format time range e.g. "12:00-12:50 PM"
const formatTimeRange = (startTime, endTime) => {
  const format12h = (tStr) => {
    if (!tStr) return "";
    const clean = String(tStr).trim().toUpperCase();
    if (clean.includes("AM") || clean.includes("PM")) return clean;
    const parts = clean.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return tStr;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    const displayM = String(m).padStart(2, "0");
    return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
  };

  const start = format12h(startTime);
  const end = format12h(endTime);
  if (start && end) {
    const startPart = start.replace(/\s*(AM|PM)$/i, "");
    return `${startPart}-${end}`;
  }
  return start || end || "12:00-12:50 PM";
};

// Fallback sample cards matching Screenshot 2 if backend returns empty
const MOCK_TODAY_CARDS = [
  { _id: "t1", subjectCode: "CSE339", room: "34-102A", status: "Absent", startTime: "12:00 PM", endTime: "12:50 PM" },
  { _id: "t2", subjectCode: "INT253", room: "33-512", status: "Present", startTime: "12:50 PM", endTime: "01:40 PM" }
];

export default function TodayTimetableWidget() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayDay = useMemo(() => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()), []);

  useEffect(() => {
    axios
      .get(`${API}/api/timetable?day=${todayDay}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setEntries(response.data);
        }
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [API, todayDay, token]);

  const cardsToDisplay = useMemo(() => {
    if (entries.length > 0) {
      return entries.map((e) => ({
        _id: e._id,
        subjectCode: e.subject?.name || "INT253",
        room: e.room || "33-512",
        status: e.teacherAttendance || "Present",
        startTime: e.startTime,
        endTime: e.endTime
      }));
    }
    return MOCK_TODAY_CARDS;
  }, [entries]);

  return (
    <section className="my-5 select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Today's Timetable
        </h2>
        
        {/* Your Dost Button */}
        <button className="bg-gradient-to-r from-[#FF7A59] via-[#FF8A65] to-[#FFC850] text-[#2C2C2E] font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs hover:opacity-95 transition cursor-pointer">
          Your Dost
        </button>
      </div>

      {/* Horizontally Scrollable Today Timetable Cards */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none pt-1">
        {cardsToDisplay.map((card) => {
          const isAbsent = card.status?.toLowerCase() === "absent";
          const timeText = formatTimeRange(card.startTime, card.endTime);

          return (
            <div
              key={card._id}
              className="w-48 sm:w-56 shrink-0 rounded-xl shadow-xs border border-amber-300/30 overflow-hidden flex flex-col"
            >
              {/* Gradient Top Card Section */}
              <div className="bg-gradient-to-r from-[#FF7A59] via-[#FF8A65] to-[#FFC850] p-3.5 flex flex-col gap-1.5 text-left text-slate-900 rounded-t-xl">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  {card.subjectCode}
                </h3>
                <p className="text-xs font-semibold text-slate-800">
                  {card.room}
                </p>

                {/* Status Badge */}
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 bg-[#FFE0B2] text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAbsent ? "bg-rose-600" : "bg-emerald-600"
                      }`}
                    />
                    {isAbsent ? "Absent" : "Present"}
                  </span>
                </div>
              </div>

              {/* Bottom Dark Time Bar */}
              <div className="bg-[#2D2D2D] text-white py-2 text-center text-xs font-semibold rounded-b-xl">
                {timeText}
              </div>
            </div>
          );
        })}
      </div>

      {/* PEP Class Undertaking Button */}
      <div className="flex justify-center mt-4 mb-2">
        <button className="bg-gradient-to-r from-[#FF7A59] via-[#FF8A65] to-[#FFC850] text-[#2C2C2E] font-bold px-6 py-2.5 rounded-lg text-xs shadow-xs hover:opacity-95 transition cursor-pointer">
          PEP Class Undertaking
        </button>
      </div>
    </section>
  );
}
