import { useEffect, useState } from "react";
import axios from "axios";

function AttendanceReport() {

const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {

const fetchAttendance = async () => {

try {

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

} catch (err) {

console.log(err);

} finally {

setLoading(false);

}

};

fetchAttendance();

}, []);

return (

<div className="p-6">

<h1 className="text-2xl font-bold mb-6 text-gray-800">
Attendance Report
</h1>

<div className="bg-white rounded-xl shadow overflow-hidden">

{loading ? (

<div className="p-6 text-center text-gray-500">
Loading attendance...
</div>

) : (

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">

<tr>
<th className="px-6 py-3 text-left">Student</th>
<th className="px-6 py-3 text-left">Class</th>
<th className="px-6 py-3 text-left">Teacher</th>
<th className="px-6 py-3 text-left">Status</th>
<th className="px-6 py-3 text-left">Date</th>
</tr>

</thead>

<tbody>

{data.length === 0 ? (

<tr>
<td colSpan="5" className="p-6 text-center text-gray-500">
No attendance found
</td>
</tr>

) : (

data.map(item => (

<tr key={item._id} className="border-t hover:bg-gray-50 transition">

<td className="px-6 py-4 flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
{item.student?.name?.charAt(0).toUpperCase()}
</div>

<span className="font-medium text-gray-800">
{item.student?.name}
</span>

</td>

<td className="px-6 py-4 text-gray-700">
{item.class?.name}
</td>

<td className="px-6 py-4 text-gray-700">
{item.teacher?.name}
</td>

<td className="px-6 py-4">

<span
className={`px-3 py-1 text-sm rounded-full font-medium ${
item.status === "Present"
? "bg-green-100 text-green-700"
: "bg-red-100 text-red-700"
}`}
>

{item.status}

</span>

</td>

<td className="px-6 py-4 text-gray-600">
{new Date(item.date).toLocaleDateString()}
</td>

</tr>

))

)}

</tbody>

</table>

)}

</div>

</div>

);

}

export default AttendanceReport;