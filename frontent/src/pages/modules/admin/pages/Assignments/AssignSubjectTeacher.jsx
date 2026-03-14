import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaChalkboardTeacher } from "react-icons/fa";

function AssignSubjectTeacher(){

const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const [subjects,setSubjects] = useState([]);
const [teachers,setTeachers] = useState([]);

const [subjectId,setSubjectId] = useState("");
const [teacherId,setTeacherId] = useState("");

useEffect(()=>{
fetchSubjects();
fetchTeachers();
},[]);

const fetchSubjects = async ()=>{
const res = await axios.get(
`${API}/api/admin/subjects`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);
setSubjects(res.data);
};

const fetchTeachers = async ()=>{
const res = await axios.get(
`${API}/api/admin/users/teachers`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);
setTeachers(res.data);
};

const handleSubmit = async(e)=>{
e.preventDefault();

await axios.post(
`${API}/api/admin/assign/assign-subject-teacher`,
{ subjectId, teacherId },
{
headers:{ Authorization:`Bearer ${token}` }
}
);

alert("Subject Assigned Successfully");

};

return(

<div className="p-6">

<div className="bg-white rounded-xl shadow-lg p-6 w-[420px] border">

<h1 className="text-xl font-semibold mb-5 text-gray-700">
Assign Subject to Teacher
</h1>

<form onSubmit={handleSubmit} className="flex flex-col gap-4">

<div className="flex items-center border rounded-lg px-3">
<FaBook className="text-gray-400 mr-2"/>
<select
className="p-2 w-full outline-none"
onChange={(e)=>setSubjectId(e.target.value)}
>
<option>Select Subject</option>

{subjects.map((s)=>(
<option key={s._id} value={s._id}>
{s.name}
</option>
))}
</select>
</div>


<div className="flex items-center border rounded-lg px-3">
<FaChalkboardTeacher className="text-gray-400 mr-2"/>
<select
className="p-2 w-full outline-none"
onChange={(e)=>setTeacherId(e.target.value)}
>
<option>Select Teacher</option>

{teachers.map((t)=>(
<option key={t._id} value={t._id}>
{t.name}
</option>
))}
</select>
</div>

<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
Assign
</button>

</form>

</div>

</div>

)

}

export default AssignSubjectTeacher;