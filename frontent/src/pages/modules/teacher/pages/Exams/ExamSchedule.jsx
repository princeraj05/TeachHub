import { useEffect,useState } from "react";
import axios from "axios";

function ExamSchedule(){

const API = import.meta.env.VITE_API_URL;

const [exams,setExams] = useState([]);

const token = localStorage.getItem("token");

useEffect(()=>{

axios.get(
`${API}/api/teacher/exams`,
{
headers:{ Authorization:`Bearer ${token}` }
}
)
.then(res=>{
setExams(res.data);
})
.catch(err=>{
console.log(err);
});

},[]);

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Exam Schedule
</h1>

<p className="mb-4">
Upcoming exams schedule
</p>

<table className="w-full bg-white shadow rounded">

<thead className="bg-gray-200">

<tr>
<th className="p-2">Class</th>
<th className="p-2">Subject</th>
<th className="p-2">Date</th>
</tr>

</thead>

<tbody>

{exams.length === 0 ? (

<tr>
<td colSpan="3" className="p-4 text-center">
No exams scheduled
</td>
</tr>

):(exams.map(e=>(

<tr key={e._id} className="border">

<td className="p-2">
{e.class?.name} ({e.class?.section})
</td>

<td className="p-2">
{e.subject?.name}
</td>

<td className="p-2">
{new Date(e.date).toLocaleDateString()}
</td>

</tr>

)))}

</tbody>

</table>

</div>

)

}

export default ExamSchedule;