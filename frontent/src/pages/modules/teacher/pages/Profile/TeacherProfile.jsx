import { useEffect, useState } from "react";
import axios from "axios";

import {
FaUserCircle,
FaEnvelope,
FaUserShield,
FaEdit,
FaSave
} from "react-icons/fa";

function TeacherProfile(){

const API = import.meta.env.VITE_API_URL;

const teacherId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const [teacher,setTeacher] = useState({
name:"",
email:"",
role:""
});

const [editMode,setEditMode] = useState(false);

useEffect(()=>{

axios.get(
`${API}/api/teacher/profile/${teacherId}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
)
.then(res=>{
setTeacher(res.data);
})
.catch(err=>{
console.log(err);
});

},[teacherId,token]);


const handleChange=(e)=>{

setTeacher({
...teacher,
[e.target.name]:e.target.value
});

};


const handleSave=()=>{

axios.put(
`${API}/api/teacher/profile/update`,
{
name:teacher.name,
email:teacher.email
},
{
headers:{
Authorization:`Bearer ${token}`
}
}
)

.then(res=>{

setTeacher(res.data.teacher);

setEditMode(false);

})
.catch(err=>{
console.log(err);
});

};


return(

<div>

<h1 className="text-3xl font-bold mb-6 text-gray-800">
Teacher Profile
</h1>

<div className="bg-white rounded-xl shadow-lg p-8 max-w-md">

<div className="flex flex-col items-center mb-6">

<div className="w-24 h-24 bg-indigo-600 text-white flex items-center justify-center rounded-full text-3xl font-bold shadow">

{teacher.name ? teacher.name.charAt(0).toUpperCase() : "T"}

</div>

<h2 className="text-xl font-semibold mt-4">
{teacher.name}
</h2>

<p className="text-gray-500">
{teacher.role}
</p>

</div>


<div className="space-y-4">

<div className="flex items-center gap-3 text-gray-700">

<FaUserCircle className="text-blue-600"/>

{editMode ? (

<input
type="text"
name="name"
value={teacher.name}
onChange={handleChange}
className="border p-2 rounded w-full"
/>

) : (

<span>
<strong>Name:</strong> {teacher.name}
</span>

)}

</div>


<div className="flex items-center gap-3 text-gray-700">

<FaEnvelope className="text-green-600"/>

{editMode ? (

<input
type="email"
name="email"
value={teacher.email}
onChange={handleChange}
className="border p-2 rounded w-full"
/>

) : (

<span>
<strong>Email:</strong> {teacher.email}
</span>

)}

</div>


<div className="flex items-center gap-3 text-gray-700">

<FaUserShield className="text-purple-600"/>

<span>
<strong>Role:</strong> {teacher.role}
</span>

</div>

</div>


{editMode ? (

<button
onClick={handleSave}
className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
>

<FaSave/>

Save Profile

</button>

) : (

<button
onClick={()=>setEditMode(true)}
className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
>

<FaEdit/>

Edit Profile

</button>

)}

</div>

</div>

);

}

export default TeacherProfile;