import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaCheckSquare, FaPlus, FaSchool, FaSearch, FaTrash, FaEdit, FaTimes, FaListUl, FaLayerGroup } from "react-icons/fa";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const classLabel = item => `Class ${item.name}`;

export default function Subjects() {
  const api = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [classIds, setClassIds] = useState([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [editingSubject, setEditingSubject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Master Syllabus Modal State
  const [syllabusSubject, setSyllabusSubject] = useState(null);
  const [syllabusChapters, setSyllabusChapters] = useState([]);
  const [savingSyllabus, setSavingSyllabus] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState("10");
  const [modalNotice, setModalNotice] = useState("");

  const loadClassMasterSyllabus = async (subject, targetClassName) => {
    try {
      const res = await axios.get(
        `${api}/api/syllabus/master?className=${encodeURIComponent(targetClassName)}&subjectName=${encodeURIComponent(subject.name)}`,
        { headers: headers() }
      );
      if (res.data && res.data.chapters) {
        setSyllabusChapters(res.data.chapters);
      } else {
        setSyllabusChapters([]);
      }
    } catch (err) {
      setSyllabusChapters([]);
    }
  };

  const sortClassesList = (list) => {
    if (!Array.isArray(list)) return [];
    const uniqueMap = new Map();
    list.forEach((cls) => {
      const className = String(cls.name || "").trim();
      if (className && !uniqueMap.has(className)) {
        uniqueMap.set(className, cls);
      }
    });
    const uniqueList = Array.from(uniqueMap.values());
    return uniqueList.sort((a, b) => {
      const numA = parseInt(String(a.name).replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.name).replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  };

  const openSyllabusModal = async (subject) => {
    setSyllabusSubject(subject);
    setModalNotice("");
    const sorted = sortClassesList(subject.classes && subject.classes.length > 0 ? subject.classes : classes);
    const firstClass = sorted.length > 0 ? sorted[0].name : "1";
    setSelectedSyllabusClass(firstClass);
    await loadClassMasterSyllabus(subject, firstClass);
  };

  const handleSyllabusClassChange = async (newClassName) => {
    setSelectedSyllabusClass(newClassName);
    setModalNotice("");
    if (syllabusSubject) {
      await loadClassMasterSyllabus(syllabusSubject, newClassName);
    }
  };

  const addChapterToMaster = () => {
    if (!newChapterTitle.trim()) return;
    const nextNo = syllabusChapters.length + 1;
    const titleAdded = newChapterTitle.trim();
    setSyllabusChapters(prev => [
      ...prev,
      {
        chapterNo: nextNo,
        title: titleAdded,
        description: newChapterDesc.trim(),
        defaultTopics: []
      }
    ]);
    setModalNotice(`Chapter ${nextNo} ("${titleAdded}") added! Click "Save Master Syllabus" below to save to Database.`);
    setTimeout(() => setModalNotice(""), 4000);
    setNewChapterTitle("");
    setNewChapterDesc("");
  };

  const removeChapterFromMaster = (index) => {
    setSyllabusChapters(prev => prev.filter((_, i) => i !== index));
  };

  const saveMasterSyllabus = async () => {
    if (!syllabusSubject) return;
    try {
      setSavingSyllabus(true);
      const formattedChapters = syllabusChapters.map((ch, idx) => ({
        chapterNo: idx + 1,
        title: ch.title,
        description: ch.description || "",
        defaultTopics: ch.topics ? ch.topics.map(t => t.title || t) : (ch.defaultTopics || [])
      }));

      await axios.post(
        `${api}/api/syllabus/master`,
        {
          className: selectedSyllabusClass,
          subjectName: syllabusSubject.name,
          chapters: formattedChapters
        },
        { headers: headers() }
      );

      setModalNotice(`✔ Master Syllabus (${formattedChapters.length} Chapters) saved successfully for Class ${selectedSyllabusClass}!`);
      setTimeout(() => {
        setModalNotice("");
        setSyllabusSubject(null);
      }, 2000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to save Master Syllabus.");
      setTimeout(() => setErrorNotice(""), 4000);
    } finally {
      setSavingSyllabus(false);
    }
  };

  const load = async () => {
    try {
      const [subjectResult, classResult] = await Promise.all([
        axios.get(`${api}/api/admin/subjects`, { headers: headers() }),
        axios.get(`${api}/api/admin/classes`, { headers: headers() })
      ]);
      setSubjects(subjectResult.data);
      setClasses(classResult.data);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subjects could not be loaded.");
      setTimeout(() => setErrorNotice(""), 5000);
    }
  };

  useEffect(() => { load(); }, [api]);

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    setErrorNotice("");
    try {
      if (editingSubject) {
        const response = await axios.put(`${api}/api/admin/subjects/${editingSubject._id}`, { name, classIds }, { headers: headers() });
        setNotice(response.data.message || "Subject updated successfully!");
        setEditingSubject(null);
      } else {
        const response = await axios.post(`${api}/api/admin/subjects`, { name, classIds }, { headers: headers() });
        setNotice(response.data.message || "Subject created successfully!");
      }
      setName("");
      setClassIds([]);
      await load();
      setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subject could not be saved.");
      setTimeout(() => setErrorNotice(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const remove = (subject) => {
    setConfirmDelete(subject);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    setNotice("");
    setErrorNotice("");
    try {
      const response = await axios.delete(`${api}/api/admin/subjects/${confirmDelete._id}`, { headers: headers() });
      setNotice(response.data.message || "Subject deleted successfully!");
      setConfirmDelete(null);
      await load();
      setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subject could not be deleted.");
      setTimeout(() => setErrorNotice(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getGroupedClasses = () => {
    if (!Array.isArray(classes)) return [];
    const map = new Map();
    classes.forEach(c => {
      const className = String(c?.name || "").trim();
      if (!className) return;
      if (!map.has(className)) {
        map.set(className, []);
      }
      map.get(className).push(c._id);
    });
    return Array.from(map.entries())
      .map(([name, ids]) => ({ name, ids }))
      .sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });
  };

  const isGroupChecked = (group) => {
    return group.ids.length > 0 && group.ids.every(id => classIds.includes(id));
  };

  const toggleGroupClass = (group) => {
    const allChecked = isGroupChecked(group);
    if (allChecked) {
      setClassIds(prev => prev.filter(id => !group.ids.includes(id)));
    } else {
      setClassIds(prev => [...new Set([...prev, ...group.ids])]);
    }
  };

  const toggleClass = id => setClassIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);

  const toggleSelectAll = () => {
    if (classes.length > 0 && classIds.length === classes.length) {
      setClassIds([]);
    } else {
      setClassIds(classes.map(c => c._id));
    }
  };

  const filtered = subjects.filter(subject => {
    const classNames = sortClassesList(subject.classes || []).map(c => `Class ${c.name}`).join(" ");
    return `${subject.name} ${classNames}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Subjects</h1>
          <p className="mt-1 text-xs font-medium text-slate-400">Create one subject and assign it to as many classes as needed.</p>
        </div>
        <div className="w-fit rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700">
          <FaBook className="mr-2 inline" />{subjects.length} Total Subjects
        </div>
      </div>

      <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
            {editingSubject ? <FaEdit /> : <FaPlus />}
          </div>
          <div>
            <h2 className="font-bold text-slate-800">
              {editingSubject ? "Edit subject details" : "Add or update a subject"}
            </h2>
            <p className="text-xs text-slate-400">
              {editingSubject ? "Modify subject name and class assignments." : "Selecting an existing subject name adds the chosen classes to it."}
            </p>
          </div>
        </div>

        {notice && <p className="mb-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
        {errorNotice && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorNotice}</p>}

        <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]">
          <label className="relative">
            <FaBook className="pointer-events-none absolute left-4 top-4 text-slate-400" />
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Subject name (e.g. Mathematics)"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500"
            />
          </label>
          
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">Assign classes</p>
              {classes.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] font-extrabold text-teal-600 hover:text-teal-700 active:scale-95 transition-all cursor-pointer bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded"
                >
                  {classIds.length === classes.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            <div className="grid max-h-32 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {getGroupedClasses().map(group => (
                <label key={group.name} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isGroupChecked(group)}
                    onChange={() => toggleGroupClass(group)}
                    className="accent-teal-600 cursor-pointer"
                  />
                  Class {group.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-center">
            <button
              type="submit"
              disabled={loading || !classIds.length}
              className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "Saving…" : <><FaPlus className="mr-2 inline" />Save subject</>}
            </button>
            {editingSubject && (
              <button
                type="button"
                onClick={() => {
                  setEditingSubject(null);
                  setName("");
                  setClassIds([]);
                }}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">All subjects</h2>
          <label className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search subjects…"
              className="rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none"
            />
          </label>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length ? filtered.map(subject => (
            <div key={subject._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  <FaBook className="mr-2 inline text-teal-600" />{subject.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sortClassesList(subject.classes).map(item => (
                    <span key={item.name} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                      <FaSchool className="mr-1 inline" />Class {item.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openSyllabusModal(subject)}
                  className="rounded-xl bg-purple-50 hover:bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700 transition border border-purple-200/60 cursor-pointer"
                >
                  <FaListUl className="mr-1 inline" />Manage Syllabus
                </button>
                <button
                  onClick={() => {
                    setEditingSubject(subject);
                    setName(subject.name);
                    setClassIds((subject.classes || []).map(item => item._id));
                  }}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <FaEdit className="mr-1 inline" />Edit subject
                </button>
                <button
                  onClick={() => remove(subject)}
                  className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-500 hover:text-white cursor-pointer"
                >
                  <FaTrash className="mr-1 inline" />Delete subject
                </button>
              </div>
            </div>
          )) : (
            <p className="p-12 text-center text-sm text-slate-400">
              <FaCheckSquare className="mr-2 inline" />No subjects found.
            </p>
          )}
        </div>
      </section>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800">
            <button
              onClick={() => setConfirmDelete(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaTrash className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete Subject</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to delete subject <span className="font-extrabold text-slate-805">{confirmDelete.name}</span> from all its assigned classes?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={loading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Subject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Master Syllabus Modal ── */}
      {syllabusSubject && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-[95] flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-fadeIn text-slate-800 dark:text-white my-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                  <FaListUl className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Master Syllabus & Chapters</h3>
                  <p className="text-[11px] font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-0.5">{syllabusSubject.name} &bull; School Blueprint Curriculum</p>
                </div>
              </div>
              <button
                onClick={() => setSyllabusSubject(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Target Class Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#7C3AED]/10 border border-[#7C3AED]/20 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#7C3AED] dark:text-[#38BDF8] tracking-wider">Select Class to Manage Syllabus</span>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">
                    Managing <span className="text-[#7C3AED] dark:text-[#38BDF8] font-black">{syllabusSubject.name}</span> Syllabus for <span className="text-[#7C3AED] dark:text-[#38BDF8] font-black">Class {selectedSyllabusClass}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="text-[#7C3AED] dark:text-[#38BDF8] text-xs shrink-0" />
                  <select
                    value={selectedSyllabusClass}
                    onChange={(e) => handleSyllabusClassChange(e.target.value)}
                    className="px-3.5 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer"
                  >
                    {sortClassesList(
                      syllabusSubject.classes && syllabusSubject.classes.length > 0
                        ? syllabusSubject.classes
                        : classes
                    ).map((cls) => (
                      <option key={cls.name} value={cls.name}>
                        Class {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Toast Notice */}
              {modalNotice && (
                <div className="p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] dark:text-[#38BDF8] rounded-xl text-xs font-bold text-center animate-fadeIn">
                  {modalNotice}
                </div>
              )}

              {/* Add New Chapter Form */}
              <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <FaPlus className="text-[10px] text-[#7C3AED] dark:text-[#38BDF8]" /> Add Chapter for Class {selectedSyllabusClass} ({syllabusSubject.name})
                  </span>
                  <span className="text-[10px] font-bold text-[#7C3AED] dark:text-[#38BDF8] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">
                    Next: Chapter {syllabusChapters.length + 1}
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={`Chapter Title (e.g. Chapter ${syllabusChapters.length + 1}: ${syllabusChapters.length === 0 ? 'Basic Concepts' : syllabusChapters.length === 1 ? 'Advanced Topics' : 'Revision'})`}
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <input
                    type="text"
                    placeholder="Short Description / Topics Overview (Optional)"
                    value={newChapterDesc}
                    onChange={(e) => setNewChapterDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addChapterToMaster}
                    disabled={!newChapterTitle.trim()}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
                  >
                    + Add Chapter {syllabusChapters.length + 1}
                  </button>
                </div>
              </div>

              {/* Master Chapters List */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Master Chapters List ({syllabusChapters.length})
                </h4>

                {syllabusChapters.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No chapters added yet for Class {selectedSyllabusClass}.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Use the form above to add standard chapters for Class {selectedSyllabusClass} ({syllabusSubject.name}).</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {syllabusChapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#7C3AED] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">{ch.title}</p>
                            {ch.description && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">{ch.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChapterFromMaster(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 transition shrink-0 cursor-pointer"
                          title="Remove Chapter"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSyllabusSubject(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMasterSyllabus}
                disabled={savingSyllabus}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md"
              >
                {savingSyllabus ? "Saving Master..." : "Save Master Syllabus"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
