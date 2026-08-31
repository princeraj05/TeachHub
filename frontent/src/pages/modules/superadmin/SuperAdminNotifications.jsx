import React, { useState, useMemo } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaDollarSign,
  FaComments,
  FaSchool,
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
  FaCheckDouble,
  FaTrash,
  FaEye,
  FaShieldAlt,
  FaInfoCircle
} from "react-icons/fa";

// Sample notification data matching design mockup
const initialNotifications = [
  {
    id: "1",
    title: "Pending Approval: New Course & Teacher Registration",
    description: "Teacher 'Adna Thompson' applied for registration under Lincoln Academy and is awaiting admin verification.",
    category: "Approvals",
    time: "5m ago",
    unread: true,
    type: "amber"
  },
  {
    id: "2",
    title: "Payment Success: G.D Academy Enterprise Plan",
    description: "Subscription payment of ₹14,999 received successfully via Razorpay for G.D Academy.",
    category: "Payments",
    time: "12m ago",
    unread: true,
    type: "emerald"
  },
  {
    id: "3",
    title: "Support Ticket #1874 Updated by School Admin",
    description: "Principal Banny Thapar submitted a query regarding student attendance reporting.",
    category: "Support",
    time: "20m ago",
    unread: true,
    type: "cyan"
  },
  {
    id: "4",
    title: "System Alert: Server Maintenance Scheduled",
    description: "Routine database maintenance and security patch deployment scheduled for Sunday at 02:00 AM UTC.",
    category: "System",
    time: "1h ago",
    unread: true,
    type: "blue"
  },
  {
    id: "5",
    title: "New School Registration: Bright Future High",
    description: "Bright Future High registered on the platform and submitted initial school credentials.",
    category: "Approvals",
    time: "3h ago",
    unread: false,
    type: "amber"
  },
  {
    id: "6",
    title: "Payment Received: Renewal for Pine Academy",
    description: "Monthly Pro plan subscription auto-renewed successfully.",
    category: "Payments",
    time: "5h ago",
    unread: false,
    type: "emerald"
  }
];

function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewItem, setViewItem] = useState(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const approvals = notifications.filter((n) => n.category === "Approvals").length;
    const payments = notifications.filter((n) => n.category === "Payments").length;
    const support = notifications.filter((n) => n.category === "Support").length;
    const system = notifications.filter((n) => n.category === "System").length;
    const totalUnread = notifications.filter((n) => n.unread).length;
    return { approvals, payments, support, system, totalUnread };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "All" || n.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [notifications, search, categoryFilter]);

  // Action handlers
  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  // Helper for category icon & color
  const getCategoryMeta = (category) => {
    switch (category) {
      case "Approvals":
        return {
          icon: <FaExclamationTriangle />,
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400"
        };
      case "Payments":
        return {
          icon: <FaDollarSign />,
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        };
      case "Support":
        return {
          icon: <FaComments />,
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
        };
      case "System":
        return {
          icon: <FaBell />,
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-400"
        };
      default:
        return {
          icon: <FaInfoCircle />,
          bg: "bg-slate-700 text-slate-300"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notifications Center</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time system alerts, user requests, and platform notifications.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto"
        >
          <FaCheckDouble className="text-blue-400 text-xs" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Pending Approvals */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{stats.approvals}</h3>
            <span className="text-xs text-amber-400/80 font-medium mt-1 inline-block">Requires review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaExclamationTriangle />
          </div>
        </div>

        {/* Card 2: Payments */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payments & Billing</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.payments}</h3>
            <span className="text-xs text-emerald-400/80 font-medium mt-1 inline-block">Recent transactions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
            <FaDollarSign />
          </div>
        </div>

        {/* Card 3: Support */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Messages</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">{stats.support}</h3>
            <span className="text-xs text-cyan-400/80 font-medium mt-1 inline-block">User inquiries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
            <FaComments />
          </div>
        </div>

        {/* Card 4: System Alerts */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Alerts</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{stats.system}</h3>
            <span className="text-xs text-blue-400/80 font-medium mt-1 inline-block">Platform logs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaBell />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["All", "Approvals", "Payments", "Support", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white border border-slate-700/60"
              }`}
            >
              {cat} {cat === "All" && `(${notifications.length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Notification Feed List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
            <FaBell className="text-3xl mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium">No notifications found</p>
            <p className="text-xs text-slate-600 mt-1">Check back later or adjust your category search filter.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const meta = getCategoryMeta(item.category);
            return (
              <div
                key={item.id}
                className={`bg-[#131B2E] border rounded-2xl p-4 md:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg ${
                  item.unread ? "border-blue-500/40 bg-[#131B2E]" : "border-slate-800/80 opacity-80"
                }`}
              >
                {/* Left Section: Icon, Unread Indicator, Title & Desc */}
                <div className="flex items-start gap-4">
                  {/* Category Icon Badge */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${meta.bg}`}>
                    {meta.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm md:text-base font-bold text-white tracking-tight">{item.title}</h4>
                      {item.unread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{item.description}</p>
                    <span className="text-[11px] text-slate-500 mt-2 block font-medium">{item.time}</span>
                  </div>
                </div>

                {/* Right Section: Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => setViewItem(item)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0B0F19] text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <FaEye className="text-slate-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleToggleRead(item.id)}
                    title={item.unread ? "Mark as Read" : "Mark as Unread"}
                    className="p-2 text-slate-400 hover:text-blue-400 bg-[#0B0F19] border border-slate-700/60 rounded-xl transition-colors"
                  >
                    <FaCheckCircle className={item.unread ? "text-slate-500" : "text-blue-400"} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Dismiss Notification"
                    className="p-2 text-slate-400 hover:text-rose-400 bg-[#0B0F19] border border-slate-700/60 rounded-xl transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Notification Detail View */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FaBell className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Notification Details</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3">
              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${getCategoryMeta(viewItem.category).bg}`}>
                {viewItem.category}
              </span>
              <h4 className="text-base font-bold text-white">{viewItem.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
                {viewItem.description}
              </p>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                <span>Received: {viewItem.time}</span>
                <span className={viewItem.unread ? "text-amber-400 font-semibold" : "text-slate-500"}>
                  {viewItem.unread ? "Unread" : "Read"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminNotifications;
