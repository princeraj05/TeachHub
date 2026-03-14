import { useEffect,useState } from "react"
import axios from "axios"

function StudentAttendance(){

const [data,setData] = useState([])

useEffect(()=>{

const token = localStorage.getItem("token")

axios.get(
"http://localhost:5000/api/student/attendance",
{
headers:{
Authorization:`Bearer ${token}`
}
}
)
.then(res=>setData(res.data))

},[])

return(

<div className="p-6">

<h2 className="text-2xl font-bold mb-6 text-gray-800">
My Attendance
</h2>

<div className="bg-white shadow-lg rounded-lg overflow-hidden">

<table className="w-full text-left">

<thead className="bg-gray-100 text-gray-700">

<tr>
<th className="px-6 py-3 font-semibold">Date</th>
<th className="px-6 py-3 font-semibold">Status</th>
</tr>

</thead>

<tbody>

{data.map((a,i)=>(

<tr key={i} className="border-t hover:bg-gray-50 transition">

<td className="px-6 py-3 text-gray-700">
{new Date(a.date).toLocaleDateString()}
</td>

<td className="px-6 py-3">

<span
className={`px-3 py-1 text-sm rounded-full font-medium ${
a.status === "Present"
? "bg-green-100 text-green-700"
: "bg-red-100 text-red-700"
}`}
>

{a.status}

</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}

export default StudentAttendance