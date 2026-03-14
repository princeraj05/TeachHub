import { useEffect, useState } from "react";
import axios from "axios";

function MyClasses(){

const API = import.meta.env.VITE_API_URL;

const [classes,setClasses] = useState([]);

useEffect(()=>{

const fetchClasses = async ()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
`${API}/api/teacher/my-classes`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setClasses(res.data);

}catch(err){
console.log(err);
}

};

fetchClasses();

},[]);

return(

<div>

<h1 className="text-2xl font-bold mb-6">
My Classes
</h1>

<div className="grid grid-cols-3 gap-4">

{classes.length === 0 ? (

<p>No classes assigned</p>

):(classes.map((c)=>(

<div
key={c._id}
className="bg-white p-4 rounded shadow"
>

<h2 className="text-lg font-semibold">
Class {c.name} ({c.section})
</h2>

<p className="text-gray-500">
Students : {c.students?.length || 0}
</p>

</div>

)))}

</div>

</div>

)

}

export default MyClasses;