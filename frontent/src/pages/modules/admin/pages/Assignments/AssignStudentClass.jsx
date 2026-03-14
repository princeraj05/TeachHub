import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaSchool } from "react-icons/fa";

function AssignStudentClass(){

const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const [classes,setClasses] = useState([]);
const [students,setStudents] = useState([]);

const [classId,setClassId] = useState("");
const [studentId,setStudentId] = useState("");

useEffect(()=>{
fetchClasses();
fetchStudents();
},[]);

const fetchClasses = async ()=>{
const res = await axios.get(
`${API}/api/admin/classes`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);
setClasses(res.data);
};

const fetchStudents = async ()=>{
const res = await axios.get(
`${API}/api/admin/users/students`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);
setStudents(res.data);
};

const handleSubmit = async(e)=>{
e.preventDefault();

await axios.post(
`${API}/api/admin/assign/assign-student-class`,
{ classId, studentId },
{
headers:{ Authorization:`Bearer ${token}` }
}
);

alert("Student Assigned Successfully");
};

return(
<div className="p-6">

<div className="bg-white rounded-xl shadow-lg p-6 w-[420px] border">

<h1 className="text-xl font-semibold mb-5 text-gray-700">
Assign Student to Class
</h1>

<form onSubmit={handleSubmit} className="flex flex-col gap-4">

<div className="flex items-center border rounded-lg px-3">
<FaSchool className="text-gray-400 mr-2"/>
<select
className="p-2 w-full outline-none"
onChange={(e)=>setClassId(e.target.value)}
>
<option>Select Class</option>

{classes.map((cls)=>(
<option key={cls._id} value={cls._id}>
{cls.name} ({cls.section})
</option>
))}
</select>
</div>


<div className="flex items-center border rounded-lg px-3">
<FaUserGraduate className="text-gray-400 mr-2"/>
<select
className="p-2 w-full outline-none"
onChange={(e)=>setStudentId(e.target.value)}
>
<option>Select Student</option>

{students.map((s)=>(
<option key={s._id} value={s._id}>
{s.name}
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

export default AssignStudentClass;