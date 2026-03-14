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
FaUserGraduate,
FaBook,
FaSchool,
FaClipboardCheck
} from "react-icons/fa";

function TeacherDashboard() {

const [data, setData] = useState({
students: 0,
subjects: 0,
classes: 0,
attendanceToday: 0,
recentStudents:[]
});

useEffect(() => {

const token = localStorage.getItem("token");

axios
.get("http://localhost:5000/api/teacher/dashboard",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>{

setData({
students:res.data?.students || 0,
subjects:res.data?.subjects || 0,
classes:res.data?.classes || 0,
attendanceToday:res.data?.attendanceToday || 0,
recentStudents:res.data?.recentStudents || []
});

})
.catch(err=>{
console.log(err);
});

},[]);


const chartData = [
{ name:"Students", value:data.students },
{ name:"Subjects", value:data.subjects },
{ name:"Classes", value:data.classes },
{ name:"Attendance", value:data.attendanceToday }
];


return(

<div>

{/* Header */}

<div className="mb-6">

<h1 className="text-3xl font-bold">
Teacher Dashboard
</h1>

</div>



{/* Stats */}

<div className="grid md:grid-cols-4 gap-6 mb-8">


<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p>My Students</p>
<p className="text-3xl font-bold">{data.students}</p>
</div>

<FaUserGraduate size={30}/>

</div>

</div>



<div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p>My Subjects</p>
<p className="text-3xl font-bold">{data.subjects}</p>
</div>

<FaBook size={30}/>

</div>

</div>



<div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p>My Classes</p>
<p className="text-3xl font-bold">{data.classes}</p>
</div>

<FaSchool size={30}/>

</div>

</div>



<div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

<div className="flex justify-between items-center">

<div>
<p>Today's Attendance</p>
<p className="text-3xl font-bold">{data.attendanceToday}</p>
</div>

<FaClipboardCheck size={30}/>

</div>

</div>

</div>



{/* Charts */}

<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4">
Teacher Overview
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

<li>👨‍🎓 My Students : {data.students}</li>
<li>📚 My Subjects : {data.subjects}</li>
<li>🏫 Classes Teaching : {data.classes}</li>
<li>📅 Academic Year : 2026</li>

</ul>

</div>

</div>



{/* Recent Students */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

<h2 className="text-xl font-semibold mb-4">
My Recent Students
</h2>

<table className="w-full">

<thead className="bg-gray-100">

<tr>
<th className="p-3 text-left">Name</th>
<th className="p-3 text-left">Email</th>
</tr>

</thead>

<tbody>

{data.recentStudents.length === 0 ? (

<tr>
<td colSpan="2" className="p-4 text-center text-gray-500">
No students found
</td>
</tr>

) : (

data.recentStudents.map(student=>(
<tr key={student._id} className="border-t">

<td className="p-3">{student.name}</td>
<td className="p-3">{student.email}</td>

</tr>
))

)}

</tbody>

</table>

</div>

</div>

);

}

export default TeacherDashboard;