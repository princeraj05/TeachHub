import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaLayerGroup } from "react-icons/fa";

function Classes() {

const [classes,setClasses] = useState([]);

const [form,setForm] = useState({
name:"",
section:""
});

const fetchClasses = async () => {

try{

const res = await axios.get(
"http://localhost:5000/api/admin/classes"
);

setClasses(res.data);

}catch(err){

console.log(err);

}

};

useEffect(()=>{
fetchClasses();
},[]);


const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};


const handleSubmit = async(e)=>{

e.preventDefault();

if(!form.name || !form.section){

alert("Please fill all fields");
return;

}

try{

await axios.post(
"http://localhost:5000/api/admin/classes",
form
);

setForm({
name:"",
section:""
});

fetchClasses();

}catch(err){

console.log(err);

}

};


const deleteClass = async(id)=>{

if(!window.confirm("Delete this class?")) return;

try{

await axios.delete(
`http://localhost:5000/api/admin/classes/${id}`
);

fetchClasses();

}catch(err){

console.log(err);

}

};


return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-6 text-gray-800">
Classes
</h1>


{/* FORM CARD */}

<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">

<h2 className="text-lg font-semibold mb-4 text-gray-700">
Create Class
</h2>

<form
onSubmit={handleSubmit}
className="flex flex-wrap gap-4"
>

<div className="flex items-center border rounded-lg px-3">

<FaSchool className="text-gray-400 mr-2"/>

<input
name="name"
placeholder="Class Name"
value={form.name}
onChange={handleChange}
className="p-2 outline-none"
/>

</div>


<div className="flex items-center border rounded-lg px-3">

<FaLayerGroup className="text-gray-400 mr-2"/>

<input
name="section"
placeholder="Section"
value={form.section}
onChange={handleChange}
className="p-2 outline-none"
/>

</div>


<button
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
>
Add Class
</button>

</form>

</div>



{/* CLASS TABLE */}

<div className="bg-white rounded-xl shadow-lg overflow-hidden border">

<table className="w-full">

<thead className="bg-gray-100 text-gray-700">

<tr>
<th className="px-6 py-3 text-left">Class</th>
<th className="px-6 py-3 text-left">Section</th>
<th className="px-6 py-3 text-left">Action</th>
</tr>

</thead>

<tbody>

{classes.length===0 ?(

<tr>

<td colSpan="3" className="p-6 text-center text-gray-500">
No classes found
</td>

</tr>

):(


classes.map((c,i)=>(

<tr
key={c._id}
className={`border-t hover:bg-gray-50 ${
i % 2 === 0 ? "bg-white" : "bg-gray-50"
}`}
>

<td className="px-6 py-4">

<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
Class {c.name}
</span>

</td>

<td className="px-6 py-4">

<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
Section {c.section}
</span>

</td>

<td className="px-6 py-4">

<button
onClick={()=>deleteClass(c._id)}
className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm transition"
>
Delete
</button>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

)

}

export default Classes;