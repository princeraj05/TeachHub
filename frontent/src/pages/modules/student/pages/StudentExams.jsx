import { useEffect,useState } from "react"
import axios from "axios"
import { FaBookOpen, FaCalendarAlt } from "react-icons/fa"

function StudentExams(){

const [exams,setExams] = useState([])

const token = localStorage.getItem("token")

useEffect(()=>{

axios.get(
"http://localhost:5000/api/student/exams",
{
headers:{ Authorization:`Bearer ${token}` }
}
)
.then(res=>setExams(res.data))

},[])

return(

<div className="p-6">

<h2 className="text-2xl font-bold mb-6 text-gray-800">
Upcoming Exams
</h2>

<div className="bg-white shadow-lg rounded-lg overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">
<tr>
<th className="text-left px-6 py-3 font-semibold">
Subject
</th>
<th className="text-left px-6 py-3 font-semibold">
Exam Date
</th>
</tr>
</thead>

<tbody>

{exams.length === 0 ? (

<tr>
<td colSpan="2" className="text-center py-6 text-gray-500">
No upcoming exams
</td>
</tr>

) : (

exams.map((e,i)=>(

<tr key={i} className="border-t hover:bg-gray-50 transition">

<td className="px-6 py-4 text-gray-800">

<div className="flex items-center gap-3">
<FaBookOpen className="text-blue-500"/>
<span className="font-medium">{e.subject}</span>
</div>

</td>

<td className="px-6 py-4 text-gray-700">

<div className="flex items-center gap-3">
<FaCalendarAlt className="text-green-500"/>
{new Date(e.date).toLocaleDateString()}
</div>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

)

}

export default StudentExams