import { useState } from "react";
import { FaCog, FaBell, FaVolumeUp, FaMoon, FaShieldAlt } from "react-icons/fa";

export default function SupportSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [availability, setAvailability] = useState("online");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Support Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure notification preferences, chat sound alerts, and availability.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6 max-w-2xl">
        
        {/* Availability */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-white">Support Status Availability</label>
          <select 
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none"
          >
            <option value="online">🟢 Online & Available for Chats</option>
            <option value="busy">🟡 Busy in Calls</option>
            <option value="offline">🔴 Offline</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Email Notifications for New Tickets</h4>
              <p className="text-[11px] text-slate-400">Receive email alert when a new request is assigned to you.</p>
            </div>
            <input 
              type="checkbox" 
              checked={emailAlerts} 
              onChange={() => setEmailAlerts(!emailAlerts)} 
              className="w-5 h-5 rounded text-purple-600 focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Chat Notification Sounds</h4>
              <p className="text-[11px] text-slate-400">Play audio ping when incoming message arrives in live chat.</p>
            </div>
            <input 
              type="checkbox" 
              checked={soundAlerts} 
              onChange={() => setSoundAlerts(!soundAlerts)} 
              className="w-5 h-5 rounded text-purple-600 focus:ring-0"
            />
          </div>

        </div>

        <button className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg">
          Save Settings
        </button>

      </div>
    </div>
  );
}
