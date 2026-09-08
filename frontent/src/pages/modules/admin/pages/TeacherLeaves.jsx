import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard, Info, CalendarCheck2, Clock3, UserCog, CalendarRange,
  UserPlus, Monitor, Users, BookOpen, ClipboardList, BarChart3,
  MessageSquare, Settings, LogOut, Search, Bell, Calendar, ChevronDown,
  Download, Eye, X, Check, SlidersHorizontal, Paperclip, ChevronLeft,
  ChevronRight, Menu, GraduationCap, Heart, Briefcase, PlusCircle, Plane,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/* Design tokens                                                     */
/* ---------------------------------------------------------------- */
const C = {
  bg: "#080B16",
  sidebar: "#0A0E1B",
  card: "#0F1526",
  cardAlt: "#0B1120",
  border: "#1C2333",
  borderSoft: "#161D2E",
  purple: "#7C5CFC",
  purpleDim: "rgba(124,92,252,0.14)",
  amber: "#F5A623",
  amberDim: "rgba(245,166,35,0.14)",
  green: "#22C58B",
  greenDim: "rgba(34,197,139,0.14)",
  red: "#F0506E",
  redDim: "rgba(240,80,110,0.14)",
  blue: "#4FA3F7",
  blueDim: "rgba(79,163,247,0.14)",
  pink: "#F06A9B",
  pinkDim: "rgba(240,106,155,0.14)",
  text: "#F3F5F9",
  sub: "#8993A8",
  faint: "#5B6478",
};

const LEAVE_META = {
  "Casual Leave": { icon: GraduationCap, color: C.purple, bg: C.purpleDim },
  "Medical Leave": { icon: Heart, color: C.pink, bg: C.pinkDim },
  "Personal Leave": { icon: Briefcase, color: C.blue, bg: C.blueDim },
  "Sick Leave": { icon: PlusCircle, color: C.red, bg: C.redDim },
  "Earned Leave": { icon: Plane, color: C.amber, bg: C.amberDim },
};

const STATUS_META = {
  Pending: { color: C.amber, bg: C.amberDim },
  Approved: { color: C.green, bg: C.greenDim },
  Rejected: { color: C.red, bg: C.redDim },
};

/* ---------------------------------------------------------------- */
/* Mock data (swap for the axios calls in your real app)             */
/* ---------------------------------------------------------------- */
const SEED = [
  { id: "1", name: "Lovely Coder", subject: "Mathematics Teacher", empId: "TCH1023", phone: "+91 98765 43210", type: "Casual Leave", from: "2026-05-26", to: "2026-05-28", duration: "3 Days", reason: "Family function at hometown. Requesting leave for 3 days.", status: "Pending", appliedOn: "22 May 2026, 10:30 AM", attachment: { name: "Invitation.pdf", size: "245 KB" } },
  { id: "2", name: "Neha Singh", subject: "Science Teacher", empId: "TCH1044", phone: "+91 98220 11239", type: "Medical Leave", from: "2026-05-19", to: "2026-05-22", duration: "4 Days", reason: "Medical checkup and rest advised.", status: "Approved", appliedOn: "18 May 2026, 09:15 AM" },
  { id: "3", name: "Ishani Kumari", subject: "English Teacher", empId: "TCH1058", phone: "+91 90123 88213", type: "Personal Leave", from: "2026-06-05", to: "2026-06-05", duration: "1 Day", reason: "Personal work.", status: "Pending", appliedOn: "20 May 2026, 02:45 PM" },
  { id: "4", name: "Amit Kumar", subject: "Social Science Teacher", empId: "TCH1071", phone: "+91 99887 65432", type: "Casual Leave", from: "2026-05-15", to: "2026-05-16", duration: "2 Days", reason: "Outstation travel.", status: "Approved", appliedOn: "14 May 2026, 11:20 AM" },
  { id: "5", name: "Pooja Verma", subject: "Computer Teacher", empId: "TCH1082", phone: "+91 97654 32189", type: "Sick Leave", from: "2026-05-12", to: "2026-05-14", duration: "3 Days", reason: "Fever and health issue.", status: "Rejected", appliedOn: "11 May 2026, 08:50 AM" },
  { id: "6", name: "Vikram Singh", subject: "Physical Education Teacher", empId: "TCH1095", phone: "+91 96123 45678", type: "Earned Leave", from: "2026-06-25", to: "2026-07-02", duration: "8 Days", reason: "Vacation with family.", status: "Pending", appliedOn: "20 May 2026, 01:10 PM" },
  { id: "7", name: "Ritika Sharma", subject: "Hindi Teacher", empId: "TCH1103", phone: "+91 95001 22334", type: "Casual Leave", from: "2026-06-02", to: "2026-06-02", duration: "1 Day", reason: "Attending a workshop.", status: "Approved", appliedOn: "21 May 2026, 09:40 AM" },
];

const AVATAR_BG = ["#7C5CFC", "#F06A9B", "#4FA3F7", "#22C58B", "#F5A623", "#EF7BE0", "#5DD0C9"];
function initials(name) { return name.split(" ").map((w) => w[0]).slice(0, 2).join(""); }

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Info, label: "About Your School" },
  { icon: CalendarCheck2, label: "Appointments" },
  { icon: Clock3, label: "Timetable" },
  { icon: UserCog, label: "Teacher Management" },
  { icon: CalendarRange, label: "Teacher Leaves", active: true },
  { icon: UserPlus, label: "Join Requests", badge: 3 },
  { icon: Monitor, label: "Conduct Exam" },
  { icon: Users, label: "Users" },
  { icon: BookOpen, label: "Academics" },
  { icon: ClipboardList, label: "Assignments" },
  { icon: BarChart3, label: "Reports" },
  { icon: MessageSquare, label: "Support Chat" },
  { icon: Settings, label: "Settings" },
];

function fmt(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ---------------------------------------------------------------- */

export default function TeacherLeaves() {
  const api = import.meta.env.VITE_API_URL;
  const headers = { Authorization: "Bearer " + localStorage.getItem("token") };

  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadLeaves = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${api}/api/teacher-leaves`, { headers });
      setLeaves(res.data);
      if (res.data?.length > 0 && !selectedId) {
        setSelectedId(res.data[0].id);
      }
    } catch (err) {
      setErrorMsg("Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [api]);

  const counts = useMemo(() => ({
    All: leaves.length,
    Pending: leaves.filter((l) => l.status === "Pending").length,
    Approved: leaves.filter((l) => l.status === "Approved").length,
    Rejected: leaves.filter((l) => l.status === "Rejected").length,
  }), [leaves]);

  const filtered = useMemo(() => leaves.filter((l) => {
    const matchesTab = tab === "All" || l.status === tab;
    const matchesQuery = l.name.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  }), [leaves, tab, query]);

  const selected = leaves.find((l) => l.id === selectedId) || null;

  const review = async (id, status) => {
    try {
      await axios.put(`${api}/api/teacher-leaves/${id}`, { status }, { headers });
      setLeaves((cur) => cur.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (err) {
      alert(err.response?.data?.message || "Could not review leave request.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 text-[13px] bg-slate-50 dark:bg-[#080B16] text-slate-900 dark:text-[#F3F5F9] font-sans transition-colors duration-200">
      <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
        Teacher Leaves <span className="text-slate-400 dark:text-[#5B6478]">›</span> <span className="text-slate-400 dark:text-[#5B6478]">Leave Requests</span>
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">Teacher Leave Requests</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-[#8993A8]">Manage leave applications submitted by teachers.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Requests", value: leaves.length, sub: "This Month", icon: ClipboardList, color: C.purple, bg: C.purpleDim },
          { label: "Pending", value: counts.Pending, sub: "Awaiting Approval", icon: Clock3, color: C.amber, bg: C.amberDim },
          { label: "Approved", value: counts.Approved, sub: "This Month", icon: Check, color: C.green, bg: C.greenDim },
          { label: "Rejected", value: counts.Rejected, sub: "This Month", icon: X, color: C.red, bg: C.redDim },
        ].map((s) => (
          <div key={s.label} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 dark:border-[#1C2333] bg-white dark:bg-[#0F1526] p-4 shadow-xs">
            <div style={{ background: s.bg }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 dark:text-[#8993A8]">{s.label}</p>
              <p className="text-[22px] font-extrabold leading-tight text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10.5px] text-slate-400 dark:text-[#5B6478]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5 xl:flex-row">
        {/* Left: table panel */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200/80 dark:border-[#1C2333] bg-white dark:bg-[#0F1526] p-1 shadow-xs">
              {["All", "Pending", "Approved", "Rejected"].map((t) => {
                const activeTab = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      activeTab
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-[#8993A8] hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {t === "All" ? "All Requests" : t}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        activeTab
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 dark:bg-[#161D2E] text-slate-500 dark:text-[#5B6478]"
                      }`}
                    >
                      {counts[t]}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="hidden shrink-0 items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-[12.5px] font-bold text-white sm:flex transition-colors shadow-xs">
              <Download size={14} /> Export
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-[#1C2333] bg-white dark:bg-[#0F1526] p-2.5 shadow-xs">
            <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-transparent px-3 py-2">
              <Search size={13} className="text-slate-400 dark:text-[#5B6478]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by teacher name..."
                className="w-full bg-transparent text-[12px] text-slate-800 dark:text-[#F3F5F9] outline-none placeholder:text-slate-400 dark:placeholder:text-[#5B6478]"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-transparent px-3 py-2 text-[12px] text-slate-600 dark:text-[#8993A8]">
              All Teachers <ChevronDown size={13} />
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-transparent px-3 py-2 text-[12px] text-slate-600 dark:text-[#8993A8]">
              All Leave Types <ChevronDown size={13} />
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-transparent px-3 py-2 text-[12px] text-slate-600 dark:text-[#8993A8]">
              <Calendar size={13} /> Select Date Range
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-transparent px-3 py-2 text-[12px] text-slate-600 dark:text-[#8993A8]">
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#1C2333] bg-white dark:bg-[#0F1526] shadow-xs">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-[#161D2E] text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-[#5B6478]">
                  <th className="px-4 py-3 font-semibold">Teacher</th>
                  <th className="px-4 py-3 font-semibold">Leave Type</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Applied On</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[12.5px] text-slate-400 dark:text-[#5B6478]">
                      <div className="flex justify-center items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></span>
                        Loading leave requests...
                      </div>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-rose-500 font-bold">
                      {errorMsg}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[12.5px] text-slate-400 dark:text-[#5B6478]">
                      No leave requests match this view.
                    </td>
                  </tr>
                ) : filtered.map((l, i) => {
                  const meta = LEAVE_META[l.type] || LEAVE_META["Casual Leave"];
                  const st = STATUS_META[l.status] || STATUS_META["Pending"];
                  return (
                    <tr key={l.id} className="border-b border-slate-100 dark:border-[#161D2E] last:border-0 align-top hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {l.teacher?.avatar ? (
                            <img src={l.teacher.avatar} alt={l.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div style={{ background: AVATAR_BG[i % AVATAR_BG.length] }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
                              {initials(l.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-[12.5px] font-semibold leading-tight text-slate-900 dark:text-[#F3F5F9]">{l.name}</p>
                            <p className="text-[11px] leading-tight text-slate-500 dark:text-[#5B6478]">{l.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div style={{ background: meta.bg }} className="flex h-6 w-6 items-center justify-center rounded-md">
                            <meta.icon size={12} color={meta.color} />
                          </div>
                          <span className="text-[12px] text-slate-700 dark:text-[#F3F5F9]">{l.type}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-600 dark:text-[#8993A8]">
                        {fmt(l.from)}<br />{fmt(l.to)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-600 dark:text-[#8993A8]">{l.duration}</td>
                      <td className="max-w-[180px] px-4 py-3.5 text-[12px] text-slate-600 dark:text-[#8993A8]">{l.reason}</td>
                      <td className="px-4 py-3.5">
                        <span style={{ background: st.bg, color: st.color }} className="rounded-full px-2.5 py-1 text-[11px] font-bold">
                          {l.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-600 dark:text-[#8993A8]">{l.appliedOn}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedId(l.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#161D2E] text-slate-600 dark:text-[#8993A8] hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          {l.status === "Pending" && (
                            <button onClick={() => review(l.id, "Rejected")} style={{ background: C.redDim, color: C.red }} className="flex h-7 w-7 items-center justify-center rounded-lg">
                              <X size={13} />
                            </button>
                          )}
                          {l.status === "Rejected" && (
                            <button onClick={() => review(l.id, "Approved")} style={{ background: C.greenDim, color: C.green }} className="flex h-7 w-7 items-center justify-center rounded-lg">
                              <Check size={13} />
                            </button>
                          )}
                          {l.status === "Approved" && (
                            <span className="flex h-7 w-7 items-center justify-center text-[15px] text-slate-400 dark:text-[#5B6478]">–</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


        </div>

        {/* Right: detail panel */}
        {selected && (
          <aside className="w-full shrink-0 self-start rounded-2xl border border-slate-200/80 dark:border-[#1C2333] bg-white dark:bg-[#0F1526] p-5 xl:w-[320px] shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white">Leave Request Details</h2>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 dark:text-[#5B6478] hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {selected.teacher?.avatar ? (
                <img src={selected.teacher.avatar} alt={selected.name} className="h-11 w-11 rounded-full object-cover shrink-0" />
              ) : (
                <div style={{ background: AVATAR_BG[leaves.findIndex((l) => l.id === selected.id) % AVATAR_BG.length] }} className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-white">
                  {initials(selected.name)}
                </div>
              )}
              <div>
                <p className="text-[13.5px] font-bold leading-tight text-slate-900 dark:text-white">{selected.name}</p>
                <p className="text-[11.5px] text-slate-500 dark:text-[#5B6478]">{selected.subject}</p>
                <p className="text-[10.5px] text-slate-400 dark:text-[#5B6478]">Employee ID: {selected.empId}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-slate-100 dark:border-[#161D2E] pt-4 text-[12px]">
              <Row label="Leave Type">
                <span style={{ 
                  background: (LEAVE_META[selected.type] || LEAVE_META["Casual Leave"]).bg, 
                  color: (LEAVE_META[selected.type] || LEAVE_META["Casual Leave"]).color 
                }} className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  {selected.type}
                </span>
              </Row>
              <Row label="From Date" value={fmt(selected.from)} />
              <Row label="To Date" value={fmt(selected.to)} />
              <Row label="Duration" value={selected.duration} />
              <Row label="Applied On" value={selected.appliedOn} />
              <Row label="Contact Number" value={selected.phone} />
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-[#161D2E] pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-[#5B6478]">Reason</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-200">{selected.reason}</p>
            </div>

            {selected.attachment && (
              <div className="mt-4 border-t border-slate-100 dark:border-[#161D2E] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-[#5B6478]">Attachments</p>
                <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#1C2333] bg-slate-50 dark:bg-[#0B1120] p-2.5">
                  <div style={{ background: C.purpleDim }} className="flex h-8 w-8 items-center justify-center rounded-lg">
                    <Paperclip size={14} color={C.purple} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold leading-tight text-slate-800 dark:text-white">{selected.attachment.name}</p>
                    <p className="text-[10.5px] text-slate-400 dark:text-[#5B6478]">{selected.attachment.size}</p>
                  </div>
                  <Download size={14} className="text-slate-400 dark:text-[#5B6478]" />
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 dark:border-[#161D2E] pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-[#5B6478]">Approval History</p>
              <div className="mt-2 flex gap-2">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600" />
                <div>
                  <p className="text-[11.5px] text-slate-700 dark:text-slate-300">{selected.appliedOn}</p>
                  <p className="text-[11px] text-slate-400 dark:text-[#5B6478]">Leave application submitted by teacher.</p>
                </div>
              </div>
            </div>

            {selected.status === "Pending" ? (
              <div className="mt-5 flex gap-2.5">
                <button onClick={() => review(selected.id, "Approved")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-[12.5px] font-bold text-white shadow-xs transition-colors">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => review(selected.id, "Rejected")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-[12.5px] font-bold text-white shadow-xs transition-colors">
                  <X size={14} /> Reject
                </button>
              </div>
            ) : (
              <button onClick={() => setSelectedId(null)} className="mt-5 w-full rounded-xl border border-slate-200 dark:border-[#1C2333] py-2.5 text-[12.5px] font-bold text-slate-600 dark:text-[#8993A8] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                Close
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-[#8993A8]">{label}</span>
      {children ?? <span className="font-medium text-slate-800 dark:text-[#F3F5F9]">{value}</span>}
    </div>
  );
}
