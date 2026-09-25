import { useEffect, useState } from "react";
import axios from "axios";
import { useCall } from "../../../../context/CallContext";
import API_URL from "../../../../config/api";

export default function GroupChat() {
  const API = API_URL;
  const isTeacher = localStorage.getItem("role") === "teacher";
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const { socket } = useCall();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("Group Chat");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      const groupsRequest = axios.get(`${API}/api/groups`, { headers });
      const studentsRequest = isTeacher ? axios.get(`${API}/api/teacher/my-students`, { headers }) : Promise.resolve({ data: [] });
      const [groupsResponse, studentsResponse] = await Promise.all([groupsRequest, studentsRequest]);
      setGroups(groupsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) { setNotice(error.response?.data?.message || "Could not load group chats."); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!active) return;
    axios.get(`${API}/api/groups/${active._id}/messages`, { headers }).then((response) => setMessages(response.data)).catch((error) => setNotice(error.response?.data?.message || "Could not load messages."));
  }, [active?._id]);
  useEffect(() => {
    if (!socket) return undefined;
    const handler = (message) => {
      if (String(message.group) === String(active?._id)) setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
    };
    socket.on("group:new-message", handler);
    return () => socket.off("group:new-message", handler);
  }, [socket, active?._id]);

  const create = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API}/api/groups`, { name, memberIds: selected }, { headers });
      setGroups((current) => [response.data, ...current]); setActive(response.data); setSelected([]); setName("Group Chat"); setNotice("Group created successfully.");
    } catch (error) { setNotice(error.response?.data?.message || "Could not create group."); }
  };
  const send = async (event) => {
    event.preventDefault(); if (!text.trim() || !active) return;
    try {
      const response = await axios.post(`${API}/api/groups/${active._id}/messages`, { content: text }, { headers });
      setMessages((current) => current.some((item) => item._id === response.data._id) ? current : [...current, response.data]); setText("");
    } catch (error) { setNotice(error.response?.data?.message || "Could not send message."); }
  };

  return <div className="max-w-6xl mx-auto space-y-4 pb-32">
    <div><p className="text-[10px] uppercase font-bold text-[#7C3AED]">Support Chat</p><h1 className="text-2xl font-extrabold dark:text-white">{isTeacher ? "Student Groups" : "My Group Chats"}</h1></div>
    {notice && <p className="text-sm text-violet-700">{notice}</p>}
    <div className="grid lg:grid-cols-[320px_1fr] gap-4"><aside className="space-y-3">
      {isTeacher && <form onSubmit={create} className="rounded-2xl bg-white dark:bg-[#0B132A] border p-4 space-y-3"><label className="block text-sm font-bold dark:text-white">Make Group</label><input required maxLength="100" className="w-full p-2 border rounded-lg" value={name} onChange={(event) => setName(event.target.value)} placeholder="Group Chat" /><div className="max-h-44 overflow-auto space-y-2">{students.length ? students.map((student) => <label className="block text-xs dark:text-white" key={student._id}><input type="checkbox" checked={selected.includes(student._id)} onChange={() => setSelected((current) => current.includes(student._id) ? current.filter((id) => id !== student._id) : [...current, student._id])} /> {student.name}</label>) : <p className="text-xs text-slate-500">No assigned students found.</p>}</div><button className="w-full py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-bold">Make Group</button></form>}
      <div className="rounded-2xl bg-white dark:bg-[#0B132A] border overflow-hidden">{groups.length ? groups.map((group) => <button type="button" onClick={() => setActive(group)} className={`block w-full text-left p-3 border-b text-sm dark:text-white ${active?._id === group._id ? "bg-violet-50 dark:bg-white/5" : ""}`} key={group._id}><b>{group.name}</b><br /><span className="text-xs text-slate-500">{group.lastMessage || "No messages yet"}</span></button>) : <p className="p-4 text-sm text-slate-500">No group chats yet.</p>}</div>
    </aside><section className="min-h-96 rounded-2xl bg-white dark:bg-[#0B132A] border flex flex-col">{active ? <><header className="p-4 border-b dark:text-white"><b>{active.name}</b><p className="mt-1 text-xs font-normal text-slate-500">Members: {active.members?.map((member) => member.name).join(", ") || "—"}</p></header><div className="flex-1 p-4 space-y-2 overflow-auto">{messages.map((message) => <div className="text-sm dark:text-white" key={message._id}><b>{message.sender?.name}:</b> {message.content}</div>)}</div><form className="p-3 border-t flex gap-2" onSubmit={send}><input className="flex-1 p-2 border rounded-lg" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" /><button className="px-4 rounded-lg bg-[#7C3AED] text-white">Send</button></form></> : <p className="m-auto text-slate-500">Select a group chat to start messaging.</p>}</section></div>
  </div>;
}
