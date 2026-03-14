import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaSchool } from "react-icons/fa";

function Subjects() {

const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const [subjects,setSubjects] = useState([]);
const [classes,setClasses] = useState([]);

const [form,setForm] = useState({
name:"",
classId:""
});


// LOAD CLASSES
const fetchClasses = async ()=>{

const res = await axios.get(
`${API}/api/admin/classes`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setClasses(res.data);

};


// LOAD SUBJECTS
const fetchSubjects = async ()=>{

const res = await axios.get(
`${API}/api/admin/subjects`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setSubjects(res.data);

};


useEffect(()=>{
fetchSubjects();
fetchClasses();
},[]);


const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};


const handleSubmit = async(e)=>{

e.preventDefault();

await axios.post(
`${API}/api/admin/subjects`,
form,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setForm({
name:"",
classId:""
});

fetchSubjects();

};


const deleteSubject = async(id)=>{

await axios.delete(
`${API}/api/admin/subjects/${id}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

fetchSubjects();

};


return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6 text-gray-800">
Subjects
</h1>


<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">

<h2 className="text-lg font-semibold mb-4 text-gray-700">
Add Subject
</h2>

<form
onSubmit={handleSubmit}
className="flex flex-wrap gap-4"
>


<div className="flex items-center border rounded-lg px-3">

<FaBook className="text-gray-400 mr-2"/>

<input
name="name"
placeholder="Subject Name"
value={form.name}
onChange={handleChange}
className="p-2 outline-none"
/>

</div>


<div className="flex items-center border rounded-lg px-3">

<FaSchool className="text-gray-400 mr-2"/>

<select
name="classId"
value={form.classId}
onChange={handleChange}
className="p-2 outline-none"
>

<option value="">Select Class</option>

{classes.map(c=>(
<option key={c._id} value={c._id}>
{c.name} {c.section}
</option>
))}

</select>

</div>


<button
className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition"
>
Add Subject
</button>

</form>

</div>


<div className="bg-white rounded-xl shadow-lg overflow-hidden border">

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">

<tr>

<th className="px-6 py-3 text-left">Subject</th>
<th className="px-6 py-3 text-left">Class</th>
<th className="px-6 py-3 text-left">Action</th>

</tr>

</thead>

<tbody>

{subjects.length === 0 ?(

<tr>

<td colSpan="3" className="p-6 text-center text-gray-500">
No subjects found
</td>

</tr>

):(subjects.map((s,i)=>(

<tr
key={s._id}
className={`border-t hover:bg-gray-50 ${
i % 2 === 0 ? "bg-white" : "bg-gray-50"
}`}
>

<td className="px-6 py-4">

<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
{s.name}
</span>

</td>

<td className="px-6 py-4">

<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
{s.class?.name} {s.class?.section}
</span>

</td>

<td className="px-6 py-4">

<button
onClick={()=>deleteSubject(s._id)}
className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm transition"
>
Delete
</button>

</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

)

}

export default Subjects;