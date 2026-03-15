import { useEffect, useState } from "react";
import axios from "axios";

function Teachers(){

const API = import.meta.env.VITE_API_URL;

const [teachers,setTeachers] = useState([]);

useEffect(()=>{

const fetchTeachers = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
`${API}/api/admin/users/teachers`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setTeachers(res.data);

}catch(err){

console.log(err);

}

};

fetchTeachers();

},[API]);

return(

<div className="p-4 sm:p-6 w-full">

<h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
Teachers
</h1>

<div className="bg-white rounded-xl shadow overflow-x-auto">

<table className="w-full min-w-[500px]">

<thead className="bg-gray-100 text-gray-700 text-sm sm:text-base">

<tr>
<th className="px-3 sm:px-6 py-3 text-left">Teacher</th>
<th className="px-3 sm:px-6 py-3 text-left">Email</th>
</tr>

</thead>

<tbody>

{teachers.length === 0 ?(

<tr>
<td colSpan="2" className="p-6 text-center text-gray-500">
No teachers found
</td>
</tr>

):(teachers.map(t=>(

<tr key={t._id} className="border-t hover:bg-gray-50 transition">

<td className="px-3 sm:px-6 py-4 flex items-center gap-3">

<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold text-sm">
{t.name.charAt(0).toUpperCase()}
</div>

<span className="font-medium text-gray-800 text-sm sm:text-base">
{t.name}
</span>

</td>

<td className="px-3 sm:px-6 py-4 text-gray-600 text-sm sm:text-base break-all">
{t.email}
</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

)

}

export default Teachers;