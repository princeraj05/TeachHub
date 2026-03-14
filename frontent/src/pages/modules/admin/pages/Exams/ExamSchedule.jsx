import { useEffect,useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaBook, FaSchool } from "react-icons/fa";

function ExamSchedule(){

const [exams,setExams] = useState([]);
const [classes,setClasses] = useState([]);
const [subjects,setSubjects] = useState([]);

const [form,setForm] = useState({
classId:"",
subjectId:"",
date:""
});

const token = localStorage.getItem("token");

useEffect(()=>{
fetchExams();
fetchClasses();
fetchSubjects();
},[]);


const fetchExams = async()=>{

const res = await axios.get(
"http://localhost:5000/api/exams",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setExams(res.data);

};


const fetchClasses = async()=>{

const res = await axios.get(
"http://localhost:5000/api/admin/classes"
);

setClasses(res.data);

};


const fetchSubjects = async()=>{

const res = await axios.get(
"http://localhost:5000/api/admin/subjects"
);

setSubjects(res.data);

};


const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};


const handleSubmit = async(e)=>{

e.preventDefault();

await axios.post(
"http://localhost:5000/api/exams",
form,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

alert("Exam created");

fetchExams();

};


const deleteExam = async(id)=>{

await axios.delete(
"http://localhost:5000/api/exams/"+id,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setExams(exams.filter(e=>e._id!==id));

};



return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6 text-gray-800">
Exam Schedule
</h1>


{/* FORM CARD */}

<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">

<h2 className="text-lg font-semibold mb-4 text-gray-700">
Create New Exam
</h2>

<form
onSubmit={handleSubmit}
className="grid md:grid-cols-3 gap-4"
>


{/* CLASS */}

<div className="flex items-center border rounded-lg px-3">

<FaSchool className="text-gray-400 mr-2"/>

<select
name="classId"
className="w-full p-2 outline-none"
onChange={handleChange}
required
>

<option>Select Class</option>

{classes.map((cls)=>(
<option key={cls._id} value={cls._id}>
{cls.name} ({cls.section})
</option>
))}

</select>

</div>



{/* SUBJECT */}

<div className="flex items-center border rounded-lg px-3">

<FaBook className="text-gray-400 mr-2"/>

<select
name="subjectId"
className="w-full p-2 outline-none"
onChange={handleChange}
required
>

<option>Select Subject</option>

{subjects.map((sub)=>(
<option key={sub._id} value={sub._id}>
{sub.name}
</option>
))}

</select>

</div>



{/* DATE */}

<div className="flex items-center border rounded-lg px-3">

<FaCalendarAlt className="text-gray-400 mr-2"/>

<input
type="date"
name="date"
className="w-full p-2 outline-none"
onChange={handleChange}
required
/>

</div>


<div className="md:col-span-3">

<button
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
>
Add Exam
</button>

</div>

</form>

</div>



{/* EXAM TABLE */}

<div className="bg-white rounded-xl shadow-lg overflow-hidden border">

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">

<tr>
<th className="px-6 py-3 text-left">Class</th>
<th className="px-6 py-3 text-left">Subject</th>
<th className="px-6 py-3 text-left">Date</th>
<th className="px-6 py-3 text-left">Action</th>
</tr>

</thead>

<tbody>

{exams.length === 0 ? (

<tr>
<td colSpan="4" className="p-6 text-center text-gray-500">
No exams scheduled
</td>
</tr>

):(exams.map((e,i)=>(

<tr
key={e._id}
className={`border-t hover:bg-gray-50 ${
i % 2 === 0 ? "bg-white" : "bg-gray-50"
}`}
>

<td className="px-6 py-4">

<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
{e.class?.name} ({e.class?.section})
</span>

</td>

<td className="px-6 py-4">

<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
{e.subject?.name}
</span>

</td>

<td className="px-6 py-4 text-gray-600">
{new Date(e.date).toLocaleDateString()}
</td>

<td className="px-6 py-4">

<button
onClick={()=>deleteExam(e._id)}
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

export default ExamSchedule;