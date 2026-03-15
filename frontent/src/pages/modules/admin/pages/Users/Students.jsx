import { useEffect, useState } from "react";
import axios from "axios";

function Students(){

const API = import.meta.env.VITE_API_URL;

const [students,setStudents] = useState([]);

useEffect(()=>{

const fetchStudents = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
`${API}/api/admin/users/students`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setStudents(res.data);

}catch(err){

console.log(err);

}

};

fetchStudents();

},[API]);

return(

<div className="p-4 sm:p-6 w-full">

<h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
Students
</h1>

<div className="bg-white rounded-xl shadow overflow-x-auto">

<table className="w-full min-w-[500px]">

<thead className="bg-gray-100 text-gray-700 text-sm sm:text-base">

<tr>
<th className="px-3 sm:px-6 py-3 text-left">Student</th>
<th className="px-3 sm:px-6 py-3 text-left">Email</th>
</tr>

</thead>

<tbody>

{students.length === 0 ?(

<tr>
<td colSpan="2" className="p-6 text-center text-gray-500">
No students found
</td>
</tr>

):(students.map(s=>(

<tr key={s._id} className="border-t hover:bg-gray-50 transition">

<td className="px-3 sm:px-6 py-4 flex items-center gap-3">

<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
{s.name.charAt(0).toUpperCase()}
</div>

<span className="font-medium text-gray-800 text-sm sm:text-base">
{s.name}
</span>

</td>

<td className="px-3 sm:px-6 py-4 text-gray-600 text-sm sm:text-base break-all">
{s.email}
</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

)

}

export default Students;