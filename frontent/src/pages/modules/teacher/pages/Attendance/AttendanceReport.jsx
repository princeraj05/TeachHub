import { useEffect, useState } from "react";
import axios from "axios";

function AttendanceReport(){

const [data,setData] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const fetchAttendance = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
"http://localhost:5000/api/attendance/report",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setData(res.data);
setLoading(false);

}catch(err){
console.log(err);
setLoading(false);
}

};

fetchAttendance();

},[]);


const getStatusStyle = (status)=>{

if(status === "Present"){
return "bg-green-100 text-green-700";
}

if(status === "Absent"){
return "bg-red-100 text-red-700";
}

return "bg-gray-100 text-gray-700";

};


return(

<div>

{/* Header */}

<div className="flex justify-between items-center mb-6">

<h1 className="text-3xl font-bold text-gray-800">
Attendance Report
</h1>

<p className="text-gray-500">
Total Records : {data.length}
</p>

</div>


{/* Card Container */}

<div className="bg-white rounded-xl shadow overflow-hidden">

{loading ? (

<div className="p-8 text-center text-gray-500">

<div className="animate-pulse">
Loading attendance...
</div>

</div>

) : (

<div className="overflow-x-auto">

<table className="w-full text-sm">

<thead className="bg-gray-100 text-gray-700">

<tr>

<th className="p-3 text-left">Student</th>
<th className="p-3 text-left">Class</th>
<th className="p-3 text-left">Teacher</th>
<th className="p-3 text-left">Status</th>
<th className="p-3 text-left">Date</th>

</tr>

</thead>

<tbody>

{data.length === 0 ? (

<tr>

<td
colSpan="5"
className="text-center p-6 text-gray-500"
>

No attendance records found

</td>

</tr>

) : (

data.map(item=>(

<tr
key={item._id}
className="border-t hover:bg-gray-50 transition"
>

<td className="p-3 font-medium">
{item.student?.name || "-"}
</td>

<td className="p-3">
{item.class?.name || "-"}
</td>

<td className="p-3">
{item.teacher?.name || "-"}
</td>

<td className="p-3">

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}
>

{item.status}

</span>

</td>

<td className="p-3 text-gray-500">

{new Date(item.date).toLocaleDateString()}

</td>

</tr>

))

)}

</tbody>

</table>

</div>

)}

</div>

</div>

);

}

export default AttendanceReport;