import { useEffect, useState } from "react";
import axios from "axios";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

import {
FaBook,
FaClipboardCheck,
FaFileAlt
} from "react-icons/fa";

function StudentDashboard() {

const [data, setData] = useState({
subjects: 0,
attendance: 0,
exams: 0
});

useEffect(() => {

const token = localStorage.getItem("token");

axios
.get(
"http://localhost:5000/api/student/dashboard",
{
headers:{
Authorization:`Bearer ${token}`
}
}
)
.then(res=>{
setData(res.data);
})
.catch(err=>{
console.log("Student Dashboard Error:",err);
});

},[]);

const chartData = [
{ name:"Subjects", value:data.subjects },
{ name:"Attendance %", value:data.attendance },
{ name:"Exams", value:data.exams }
];

return (

<div>

<h1 className="text-3xl font-bold mb-6 text-gray-800">
Student Dashboard
</h1>


{/* Stats */}

<div className="grid md:grid-cols-3 gap-6 mb-8">

<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p className="text-sm opacity-80">Total Subjects</p>
<p className="text-3xl font-bold">{data.subjects}</p>
</div>

<FaBook size={30}/>

</div>

</div>


<div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p className="text-sm opacity-80">Attendance</p>
<p className="text-3xl font-bold">{data.attendance}%</p>
</div>

<FaClipboardCheck size={30}/>

</div>

</div>


<div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p className="text-sm opacity-80">Upcoming Exams</p>
<p className="text-3xl font-bold">{data.exams}</p>
</div>

<FaFileAlt size={30}/>

</div>

</div>

</div>


{/* Charts */}

<div className="grid md:grid-cols-2 gap-6">

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4">
Student Overview
</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={chartData}>

<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="value" fill="#6366f1"/>

</BarChart>

</ResponsiveContainer>

</div>



<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4">
Quick Info
</h2>

<ul className="space-y-3 text-gray-600">

<li>📚 Subjects Enrolled : {data.subjects}</li>
<li>📊 Attendance : {data.attendance}%</li>
<li>📝 Upcoming Exams : {data.exams}</li>
<li>📅 Academic Year : 2026</li>

</ul>

</div>

</div>



{/* Recent Activities */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

<h2 className="text-xl font-semibold mb-4">
Recent Activities
</h2>

<table className="w-full">

<thead className="bg-gray-100">

<tr>
<th className="p-3 text-left">Activity</th>
<th className="p-3 text-left">Date</th>
</tr>

</thead>

<tbody>

<tr className="border-t hover:bg-gray-50">
<td className="p-3">Math Class Attended</td>
<td className="p-3">10 Mar 2026</td>
</tr>

<tr className="border-t hover:bg-gray-50">
<td className="p-3">Science Practical Completed</td>
<td className="p-3">09 Mar 2026</td>
</tr>

<tr className="border-t hover:bg-gray-50">
<td className="p-3">English Test Scheduled</td>
<td className="p-3">15 Mar 2026</td>
</tr>

</tbody>

</table>

</div>

</div>

);

}

export default StudentDashboard;