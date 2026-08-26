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
    <div style={{ background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }} className="flex h-full min-h-[820px] w-full text-[13px]">
      {/* ---------------- Sidebar ---------------- */}
      <aside style={{ background: C.sidebar, borderRight: `1px solid ${C.borderSoft}` }} className="hidden w-56 shrink-0 flex-col py-5 lg:flex">
        <div className="flex items-center gap-2 px-5 pb-6">
          <div style={{ background: C.purple }} className="flex h-8 w-8 items-center justify-center rounded-lg">
            <GraduationCap size={18} color="#fff" />
          </div>
          <span className="text-[17px] font-extrabold">
            Teach<span style={{ color: C.purple }}>Hub</span>
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => (
            <button
              key={item.label}
              style={item.active ? { background: C.purple, color: "#fff" } : { color: C.sub }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-white/5"
            >
              <item.icon size={16} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span style={{ background: C.red }} className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-4 space-y-3 px-3">
          <div style={{ borderColor: C.borderSoft }} className="flex items-center gap-2 rounded-xl border p-2.5">
            <div style={{ background: C.purple }} className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
              BT
              <span style={{ background: C.green, borderColor: C.sidebar }} className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold">Banny Thapar</p>
              <p style={{ color: C.faint }} className="text-[10px]">School Admin</p>
            </div>
            <ChevronDown size={14} style={{ color: C.faint }} />
          </div>
          <button style={{ color: "#F0506E" }} className="flex w-full items-center gap-3 px-3 py-1 text-[13px] font-medium">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header style={{ borderColor: C.borderSoft }} className="flex items-center gap-4 border-b px-6 py-3.5">
          <Menu size={20} style={{ color: C.sub }} className="lg:hidden" />
          <div>
            <p className="text-[13px] font-bold leading-tight">School: G.D Accedmy</p>
            <p style={{ color: C.faint }} className="text-[11px] leading-tight">School Admin Panel</p>
          </div>
          <div style={{ background: C.card, borderColor: C.border }} className="ml-4 hidden flex-1 max-w-sm items-center gap-2 rounded-xl border px-3 py-2 md:flex">
            <Search size={14} style={{ color: C.faint }} />
            <input placeholder="Search anything..." style={{ color: C.text }} className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#5B6478]" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Bell size={18} style={{ color: C.sub }} />
              <span style={{ background: C.purple }} className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white">8</span>
            </div>
            <Calendar size={18} style={{ color: C.sub }} />
            <div style={{ background: C.card, borderColor: C.border }} className="flex items-center gap-2 rounded-xl border px-3 py-1.5">
              <div>
                <p style={{ color: C.faint }} className="text-[9px] leading-none">Academic Year</p>
                <p className="text-[12px] font-bold leading-tight">2026</p>
              </div>
              <ChevronDown size={13} style={{ color: C.faint }} />
            </div>
            <div style={{ background: C.purple }} className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">BT</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <p style={{ color: C.purple }} className="text-[11px] font-semibold">
            Teacher Leaves <span style={{ color: C.faint }}>›</span> <span style={{ color: C.faint }}>Leave Requests</span>
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-extrabold">Teacher Leave Requests</h1>
              <p style={{ color: C.sub }} className="mt-0.5 text-[12.5px]">Manage leave applications submitted by teachers.</p>
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
              <div key={s.label} style={{ background: C.card, borderColor: C.border }} className="flex items-start gap-3 rounded-2xl border p-4">
                <div style={{ background: s.bg }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <s.icon size={18} color={s.color} />
                </div>
                <div>
                  <p style={{ color: C.sub }} className="text-[12px]">{s.label}</p>
                  <p className="text-[22px] font-extrabold leading-tight">{s.value}</p>
                  <p style={{ color: C.faint }} className="text-[10.5px]">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-5 xl:flex-row">
            {/* Left: table panel */}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div style={{ background: C.card, borderColor: C.border }} className="flex flex-wrap gap-1 rounded-xl border p-1">
                  {["All", "Pending", "Approved", "Rejected"].map((t) => {
                    const activeTab = tab === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={activeTab ? { background: C.purple, color: "#fff" } : { color: C.sub }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                      >
                        {t === "All" ? "All Requests" : t}
                        <span
                          style={activeTab ? { background: "rgba(255,255,255,0.22)" } : { background: C.borderSoft, color: C.faint }}
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                        >
                          {counts[t]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button style={{ background: C.purple }} className="hidden shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-bold text-white sm:flex">
                  <Download size={14} /> Export
                </button>
              </div>

              {/* Filters */}
              <div style={{ background: C.card, borderColor: C.border }} className="flex flex-wrap items-center gap-2 rounded-2xl border p-2.5">
                <div style={{ borderColor: C.border }} className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border px-3 py-2">
                  <Search size={13} style={{ color: C.faint }} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by teacher name..."
                    style={{ color: C.text }}
                    className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#5B6478]"
                  />
                </div>
                <button style={{ borderColor: C.border, color: C.sub }} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px]">
                  All Teachers <ChevronDown size={13} />
                </button>
                <button style={{ borderColor: C.border, color: C.sub }} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px]">
                  All Leave Types <ChevronDown size={13} />
                </button>
                <button style={{ borderColor: C.border, color: C.sub }} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px]">
                  <Calendar size={13} /> Select Date Range
                </button>
                <button style={{ borderColor: C.border, color: C.sub }} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px]">
                  <SlidersHorizontal size={13} /> Filters
                </button>
              </div>

              {/* Table */}
              <div style={{ background: C.card, borderColor: C.border }} className="overflow-x-auto rounded-2xl border">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr style={{ borderColor: C.borderSoft, color: C.faint }} className="border-b text-[10.5px] uppercase tracking-wider">
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
                        <td colSpan={8} style={{ color: C.faint }} className="px-4 py-10 text-center text-[12.5px]">
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
                        <td colSpan={8} style={{ color: C.faint }} className="px-4 py-10 text-center text-[12.5px]">
                          No leave requests match this view.
                        </td>
                      </tr>
                    ) : filtered.map((l, i) => {
                      const meta = LEAVE_META[l.type] || LEAVE_META["Casual Leave"];
                      const st = STATUS_META[l.status] || STATUS_META["Pending"];
                      return (
                        <tr key={l.id} style={{ borderColor: C.borderSoft }} className="border-b last:border-0 align-top">
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
                                <p className="text-[12.5px] font-semibold leading-tight">{l.name}</p>
                                <p style={{ color: C.faint }} className="text-[11px] leading-tight">{l.subject}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div style={{ background: meta.bg }} className="flex h-6 w-6 items-center justify-center rounded-md">
                                <meta.icon size={12} color={meta.color} />
                              </div>
                              <span className="text-[12px]">{l.type}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[12px]" style={{ color: C.sub }}>
                            {fmt(l.from)}<br />{fmt(l.to)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[12px]" style={{ color: C.sub }}>{l.duration}</td>
                          <td className="max-w-[180px] px-4 py-3.5 text-[12px]" style={{ color: C.sub }}>{l.reason}</td>
                          <td className="px-4 py-3.5">
                            <span style={{ background: st.bg, color: st.color }} className="rounded-full px-2.5 py-1 text-[11px] font-bold">
                              {l.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[12px]" style={{ color: C.sub }}>{l.appliedOn}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedId(l.id)}
                                style={{ background: C.borderSoft, color: C.sub }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
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
                                <span style={{ color: C.faint }} className="flex h-7 w-7 items-center justify-center text-[15px]">–</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <p style={{ color: C.faint }} className="text-[12px]">
                  Showing 1 to {filtered.length} of {leaves.length} entries
                </p>
                <div className="flex items-center gap-1.5">
                  <button style={{ borderColor: C.border, color: C.sub }} className="flex h-7 w-7 items-center justify-center rounded-lg border"><ChevronLeft size={13} /></button>
                  {[1, 2, 3, 4].map((p) => (
                    <button key={p} style={p === 1 ? { background: C.purple, color: "#fff" } : { color: C.sub }} className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold">
                      {p}
                    </button>
                  ))}
                  <button style={{ borderColor: C.border, color: C.sub }} className="flex h-7 w-7 items-center justify-center rounded-lg border"><ChevronRight size={13} /></button>
                  <button style={{ borderColor: C.border, color: C.sub }} className="ml-2 flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px]">
                    10 / page <ChevronDown size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: detail panel */}
            {selected && (
              <aside style={{ background: C.card, borderColor: C.border }} className="w-full shrink-0 self-start rounded-2xl border p-5 xl:w-[320px]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14.5px] font-bold">Leave Request Details</h2>
                  <button onClick={() => setSelectedId(null)} style={{ color: C.faint }}><X size={16} /></button>
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
                    <p className="text-[13.5px] font-bold leading-tight">{selected.name}</p>
                    <p style={{ color: C.faint }} className="text-[11.5px]">{selected.subject}</p>
                    <p style={{ color: C.faint }} className="text-[10.5px]">Employee ID: {selected.empId}</p>
                  </div>
                </div>

                <div style={{ borderColor: C.borderSoft }} className="mt-4 space-y-2.5 border-t pt-4 text-[12px]">
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

                <div style={{ borderColor: C.borderSoft }} className="mt-4 border-t pt-4">
                  <p style={{ color: C.faint }} className="text-[11px] font-bold uppercase tracking-wide">Reason</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed">{selected.reason}</p>
                </div>

                {selected.attachment && (
                  <div style={{ borderColor: C.borderSoft }} className="mt-4 border-t pt-4">
                    <p style={{ color: C.faint }} className="text-[11px] font-bold uppercase tracking-wide">Attachments</p>
                    <div style={{ background: C.cardAlt, borderColor: C.border }} className="mt-2 flex items-center gap-2.5 rounded-xl border p-2.5">
                      <div style={{ background: C.purpleDim }} className="flex h-8 w-8 items-center justify-center rounded-lg">
                        <Paperclip size={14} color={C.purple} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold leading-tight">{selected.attachment.name}</p>
                        <p style={{ color: C.faint }} className="text-[10.5px]">{selected.attachment.size}</p>
                      </div>
                      <Download size={14} style={{ color: C.faint }} />
                    </div>
                  </div>
                )}

                <div style={{ borderColor: C.borderSoft }} className="mt-4 border-t pt-4">
                  <p style={{ color: C.faint }} className="text-[11px] font-bold uppercase tracking-wide">Approval History</p>
                  <div className="mt-2 flex gap-2">
                    <div style={{ background: C.purple }} className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <div>
                      <p className="text-[11.5px]">{selected.appliedOn}</p>
                      <p style={{ color: C.faint }} className="text-[11px]">Leave application submitted by teacher.</p>
                    </div>
                  </div>
                </div>

                {selected.status === "Pending" ? (
                  <div className="mt-5 flex gap-2.5">
                    <button onClick={() => review(selected.id, "Approved")} style={{ background: C.green }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold text-white">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => review(selected.id, "Rejected")} style={{ background: C.red }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold text-white">
                      <X size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setSelectedId(null)} style={{ borderColor: C.border, color: C.sub }} className="mt-5 w-full rounded-xl border py-2.5 text-[12.5px] font-bold">
                    Close
                  </button>
                )}
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "#8993A8" }}>{label}</span>
      {children ?? <span style={{ color: "#F3F5F9" }} className="font-medium">{value}</span>}
    </div>
  );
}