import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaChalkboardTeacher } from "react-icons/fa";

function AssignTeacherClass(){

const [classes,setClasses] = useState([]);
const [teachers,setTeachers] = useState([]);

const [classId,setClassId] = useState("");
const [teacherId,setTeacherId] = useState("");

useEffect(()=>{
fetchClasses();
fetchTeachers();
},[]);

const fetchClasses = async ()=>{
const res = await axios.get("http://localhost:5000/api/admin/classes");
setClasses(res.data);
};

const fetchTeachers = async ()=>{
const res = await axios.get("http://localhost:5000/api/admin/users/teachers");
setTeachers(res.data);
};

const handleSubmit = async(e)=>{
e.preventDefault();

await axios.post(
"http://localhost:5000/api/admin/assign/assign-teacher-class",
{ classId, teacherId }
);

alert("Teacher Assigned Successfully");

};

return(

<div className="p-6">

<div className="bg-white rounded-xl shadow-lg p-6 w-[420px] border">

<h1 className="text-xl font-semibold mb-5 text-gray-700">
Assign Teacher to Class
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

export default AssignTeacherClass;