import { useEffect,useState } from "react";
import axios from "axios";

function MySubjects(){

const [subjects,setSubjects] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const fetchSubjects = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
"http://localhost:5000/api/teacher/my-subjects",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setSubjects(res.data);
setLoading(false);

}catch(err){
console.log(err);
setLoading(false);
}

};

fetchSubjects();

},[]);


return(

<div>

<h1 className="text-2xl font-bold mb-4">
My Subjects
</h1>

<p className="mb-4">
Subjects assigned to this teacher
</p>

{loading ? (
<p>Loading subjects...</p>
) : subjects.length === 0 ? (
<p>No subjects assigned</p>
) : (

<table className="w-full border">

<thead className="bg-gray-200">
<tr>
<th className="p-2 border">Subject</th>
<th className="p-2 border">Class</th>
</tr>
</thead>

<tbody>

{subjects.map((s)=>(
<tr key={s._id}>
<td className="p-2 border">{s.name}</td>
<td className="p-2 border">
{s.class?.name} ({s.class?.section})
</td>
</tr>
))}

</tbody>

</table>

)}

</div>

)

}

export default MySubjects;