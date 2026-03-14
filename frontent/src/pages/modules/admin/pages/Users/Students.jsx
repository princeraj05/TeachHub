import { useEffect, useState } from "react";
import axios from "axios";

function Students(){

const [students,setStudents] = useState([]);

useEffect(()=>{

axios
.get("http://localhost:5000/api/admin/users/students")
.then(res=>{
setStudents(res.data);
})
.catch(err=>{
console.log(err);
});

},[]);

return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6 text-gray-800">
Students
</h1>

<div className="bg-white rounded-xl shadow overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">

<tr>
<th className="px-6 py-3 text-left">Student</th>
<th className="px-6 py-3 text-left">Email</th>
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

<td className="px-6 py-4 flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
{s.name.charAt(0).toUpperCase()}
</div>

<span className="font-medium text-gray-800">
{s.name}
</span>

</td>

<td className="px-6 py-4 text-gray-600">
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