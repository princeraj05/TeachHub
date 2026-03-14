import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaEnvelope, FaUserTag } from "react-icons/fa";

function StudentProfile() {

const [student,setStudent] = useState({
name:"",
email:"",
role:""
});

useEffect(()=>{

const token = localStorage.getItem("token");

axios.get(
"http://localhost:5000/api/student/profile",
{
headers:{
Authorization:`Bearer ${token}`
}
}
)
.then(res=>{
setStudent(res.data);
})
.catch(err=>{
console.log("Profile Error:",err);
});

},[]);

return(

<div className="p-6 flex justify-center">

<div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8">

<h2 className="text-2xl font-bold mb-8 text-gray-800">
My Profile
</h2>

{/* Avatar */}
<div className="flex items-center gap-4 mb-8">

<div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl font-bold">
{student.name ? student.name.charAt(0).toUpperCase() : "S"}
</div>

<div>
<h3 className="text-lg font-semibold text-gray-800">
{student.name}
</h3>
<p className="text-gray-500 text-sm">Student Account</p>
</div>

</div>

{/* Profile Details */}

<div className="space-y-5">

<div className="flex items-center gap-3 border-b pb-3">

<FaUserGraduate className="text-blue-500"/>

<p className="text-gray-700">
<span className="font-semibold">Name:</span> {student.name}
</p>

</div>

<div className="flex items-center gap-3 border-b pb-3">

<FaEnvelope className="text-green-500"/>

<p className="text-gray-700">
<span className="font-semibold">Email:</span> {student.email}
</p>

</div>

<div className="flex items-center gap-3">

<FaUserTag className="text-purple-500"/>

<p className="text-gray-700">
<span className="font-semibold">Role:</span> 
<span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
{student.role}
</span>
</p>

</div>

</div>

</div>

</div>

);

}

export default StudentProfile;