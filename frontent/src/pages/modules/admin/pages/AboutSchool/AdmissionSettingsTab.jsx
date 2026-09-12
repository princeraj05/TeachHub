import React, { useState } from "react";
import {
  FaSchool,
  FaClipboardList,
  FaBuilding,
  FaClock,
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";

const ALL_CATEGORIES = [
  "Play School",
  "Primary",
  "Secondary",
  "Higher Secondary",
  "Co-Educational",
  "Girls School",
  "Day School",
  "Residential"
];

function AdmissionSettingsTab({
  schoolCategoriesList, setSchoolCategoriesList,
  admissionProcess, setAdmissionProcess,
  schoolBoardType, setSchoolBoardType,
  workingDays, setWorkingDays,
  openingTime, setOpeningTime,
  closingTime, setClosingTime,
  shortBreakStartTime, setShortBreakStartTime,
  shortBreakDuration, setShortBreakDuration,
  lunchBreakStartTime, setLunchBreakStartTime,
  lunchBreakDuration, setLunchBreakDuration,
  holidays, setHolidays
}) {

  // Local state for holiday input modal/prompt
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  const handleCategoryToggle = (cat) => {
    if (schoolCategoriesList.includes(cat)) {
      setSchoolCategoriesList(schoolCategoriesList.filter(item => item !== cat));
    } else {
      setSchoolCategoriesList([...schoolCategoriesList, cat]);
    }
  };

  const handleDayToggle = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    setHolidays([...holidays, { date: newHolidayDate, name: newHolidayName }]);
    setNewHolidayName("");
    setNewHolidayDate("");
    setShowAddHoliday(false);
  };

  const handleRemoveHoliday = (idx) => {
    const updated = [...holidays];
    updated.splice(idx, 1);
    setHolidays(updated);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* THREE COLUMN GRID: CATEGORIES, ADMISSION, TYPE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* School Categories */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
              <FaSchool className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">School Categories</h3>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">Select all categories that apply to your school.</p>
            
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
              {ALL_CATEGORIES.map(cat => {
                const checked = schoolCategoriesList.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#131B35]/40 hover:bg-slate-100 dark:hover:bg-[#131B35]/80 border border-slate-200/60 dark:border-white/5 cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCategoryToggle(cat)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-600 focus:ring-purple-500/20"
                    />
                    <span className={`text-xs font-semibold ${checked ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400"}`}>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Admission Process */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
              <FaClipboardList className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Admission Process</h3>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">Select all admission processes that apply to your school.</p>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {[
                { title: "Entrance Exam Required", desc: "Students need to clear an entrance exam for admission." },
                { title: "Direct Admission", desc: "Students can get admission directly without entrance exam." },
                { title: "Merit Based Admission", desc: "Admission granted based on past academic marks & grades." },
                { title: "Interaction / Interview", desc: "Student & parent interaction or oral interview." }
              ].map(opt => {
                const processList = Array.isArray(admissionProcess) ? admissionProcess : (admissionProcess ? [admissionProcess] : []);
                const checked = processList.includes(opt.title);

                const toggleOption = () => {
                  if (checked) {
                    setAdmissionProcess(processList.filter(item => item !== opt.title));
                  } else {
                    setAdmissionProcess([...processList, opt.title]);
                  }
                };

                return (
                  <label key={opt.title} className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                    checked
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-600/10"
                      : "border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#131B35]/20 hover:bg-slate-100 dark:hover:bg-[#131B35]/40"
                  }`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={toggleOption}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-600 focus:ring-purple-500/20"
                    />
                    <div>
                      <span className={`block text-xs font-bold ${
                        checked ? "text-purple-600 dark:text-purple-400 font-extrabold" : "text-slate-900 dark:text-white"
                      }`}>{opt.title}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* School Board Type */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
              <FaBuilding className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">School Type</h3>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">Select your school type.</p>

            <div className="space-y-3">
              {["Private", "Government", "Government Aided", "Trust / Society"].map(type => {
                const isSelected = schoolBoardType === type;
                let subtitle = "Privately owned and managed";
                if (type === "Government") subtitle = "Government owned and managed";
                if (type === "Government Aided") subtitle = "Partially funded by government";
                if (type === "Trust / Society") subtitle = "Managed by trust or society";
                
                return (
                  <label key={type} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border transition cursor-pointer select-none ${
                    isSelected ? "border-purple-600 bg-purple-50 dark:bg-purple-600/10" : "border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#131B35]/20 hover:bg-slate-100 dark:hover:bg-[#131B35]/40"
                  }`}>
                    <input
                      type="radio"
                      name="schoolBoardType"
                      value={type}
                      checked={isSelected}
                      onChange={() => setSchoolBoardType(type)}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500/20"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{type}</span>
                      <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* LOWER ROW: AVAILABILITY SETTINGS */}
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
          <FaClock className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Availability Settings</h3>
        </div>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">Set school availability and operational days.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Working Days Checkboxes */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">School Working Days</label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                      active ? "border-purple-600 bg-purple-600/10 text-purple-700 dark:text-white" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* School Timings & Breaks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Opening Time</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                  placeholder="08:00 AM"
                />
                <input
                  type="time"
                  id="admission-opening-picker"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hStr, mStr] = e.target.value.split(":");
                      let h = parseInt(hStr, 10);
                      const ampm = h >= 12 ? "PM" : "AM";
                      const displayH = h % 12 || 12;
                      setOpeningTime(`${String(displayH).padStart(2, "0")}:${mStr} ${ampm}`);
                    }
                  }}
                />
                <div className="absolute right-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const picker = document.getElementById("admission-opening-picker");
                      if (picker) {
                        if (typeof picker.showPicker === "function") {
                          picker.showPicker();
                        } else {
                          picker.focus();
                          picker.click();
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-xs p-1 cursor-pointer transition"
                    title="Click to select time"
                  >
                    <FaClock />
                  </button>
                  <div className="flex gap-1 bg-slate-200/50 dark:bg-white/10 p-0.5 rounded-lg border border-slate-300/40 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const raw = (openingTime || "08:00").replace(/am|pm/gi, "").trim();
                        setOpeningTime(`${raw || "08:00"} AM`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition cursor-pointer ${
                        (openingTime || "").toUpperCase().includes("AM")
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const raw = (openingTime || "08:00").replace(/am|pm/gi, "").trim();
                        setOpeningTime(`${raw || "08:00"} PM`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition cursor-pointer ${
                        (openingTime || "").toUpperCase().includes("PM")
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Closing Time</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                  placeholder="04:00 PM"
                />
                <input
                  type="time"
                  id="admission-closing-picker"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hStr, mStr] = e.target.value.split(":");
                      let h = parseInt(hStr, 10);
                      const ampm = h >= 12 ? "PM" : "AM";
                      const displayH = h % 12 || 12;
                      setClosingTime(`${String(displayH).padStart(2, "0")}:${mStr} ${ampm}`);
                    }
                  }}
                />
                <div className="absolute right-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const picker = document.getElementById("admission-closing-picker");
                      if (picker) {
                        if (typeof picker.showPicker === "function") {
                          picker.showPicker();
                        } else {
                          picker.focus();
                          picker.click();
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-xs p-1 cursor-pointer transition"
                    title="Click to select time"
                  >
                    <FaClock />
                  </button>
                  <div className="flex gap-1 bg-slate-200/50 dark:bg-white/10 p-0.5 rounded-lg border border-slate-300/40 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const raw = (closingTime || "04:00").replace(/am|pm/gi, "").trim();
                        setClosingTime(`${raw || "04:00"} AM`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition cursor-pointer ${
                        (closingTime || "").toUpperCase().includes("AM")
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const raw = (closingTime || "04:00").replace(/am|pm/gi, "").trim();
                        setClosingTime(`${raw || "04:00"} PM`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition cursor-pointer ${
                        (closingTime || "").toUpperCase().includes("PM")
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lunch Break Settings */}
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lunch Break Start & Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={lunchBreakStartTime || "12:30 PM"}
                    onChange={(e) => setLunchBreakStartTime(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                    placeholder="12:30 PM"
                  />
                  <input
                    type="time"
                    id="admission-lunch-picker"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.value) {
                        const [hStr, mStr] = e.target.value.split(":");
                        let h = parseInt(hStr, 10);
                        const ampm = h >= 12 ? "PM" : "AM";
                        const displayH = h % 12 || 12;
                        setLunchBreakStartTime(`${String(displayH).padStart(2, "0")}:${mStr} ${ampm}`);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const picker = document.getElementById("admission-lunch-picker");
                      if (picker) {
                        if (typeof picker.showPicker === "function") {
                          picker.showPicker();
                        } else {
                          picker.focus();
                          picker.click();
                        }
                      }
                    }}
                    className="absolute right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-xs p-1 cursor-pointer transition"
                    title="Click to select time"
                  >
                    <FaClock />
                  </button>
                </div>
                <select
                  value={lunchBreakDuration || 60}
                  onChange={(e) => setLunchBreakDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-bold cursor-pointer"
                >
                  <option value={30}>30 Mins</option>
                  <option value={45}>45 Mins</option>
                  <option value={60}>60 Mins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Holidays List */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Holidays</label>
              <button
                type="button"
                onClick={() => setShowAddHoliday(!showAddHoliday)}
                className="flex items-center gap-1 text-[8px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                <FaPlus /> Add Holiday
              </button>
            </div>

            {/* Holiday inputs toggle */}
            {showAddHoliday && (
              <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 15 Aug"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddHoliday(false)}
                    className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[9px] text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="px-2.5 py-1 rounded bg-purple-600 text-[9px] text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Tag items */}
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(holidays) ? holidays : []).map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-[9px] font-bold px-2.5 py-1 rounded-lg">
                  {h.date} ({h.name})
                  <button
                    type="button"
                    onClick={() => handleRemoveHoliday(i)}
                    className="text-slate-450 hover:text-rose-500 cursor-pointer transition text-[8px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {(Array.isArray(holidays) ? holidays : []).length === 0 && (
                <span className="text-[10px] text-slate-500 italic">No holidays configured.</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Info warning banner */}
      <div className="bg-purple-50 dark:bg-[#0F172A] border border-purple-200 dark:border-slate-850 rounded-xl px-4 py-3.5 text-xs text-slate-700 dark:text-slate-350 mt-4 flex items-center gap-2.5">
        <FaInfoCircle className="text-purple-500 text-base" />
        <span>These settings will be visible to parents and students on the admission and school profile pages.</span>
      </div>

    </div>
  );
}

export default AdmissionSettingsTab;
