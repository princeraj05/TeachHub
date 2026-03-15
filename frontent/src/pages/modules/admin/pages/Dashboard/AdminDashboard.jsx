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
  FaChalkboardTeacher,
  FaBook,
  FaSchool
} from "react-icons/fa";

function AdminDashboard() {

  const API = import.meta.env.VITE_API_URL;

  const [data,setData] = useState({
    students:0,
    teachers:0,
    classes:0,
    subjects:0
  });

  useEffect(()=>{

    const fetchDashboard = async()=>{

      try{

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API}/api/admin/dashboard`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );

        setData(res.data);

      }catch(err){

        console.log("Dashboard error:",err);

      }

    };

    fetchDashboard();

  },[API]);


  const chartData = [
    { name:"Students", value:data.students },
    { name:"Teachers", value:data.teachers },
    { name:"Classes", value:data.classes },
    { name:"Subjects", value:data.subjects }
  ];

  return(

    <div className="w-full">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Admin Dashboard
        </h1>
      </div>


      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm md:text-base">Total Students</p>
              <p className="text-2xl md:text-3xl font-bold">{data.students}</p>
            </div>

            <FaUserGraduate className="text-2xl md:text-3xl"/>

          </div>

        </div>



        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm md:text-base">Total Teachers</p>
              <p className="text-2xl md:text-3xl font-bold">{data.teachers}</p>
            </div>

            <FaChalkboardTeacher className="text-2xl md:text-3xl"/>

          </div>

        </div>



        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm md:text-base">Total Classes</p>
              <p className="text-2xl md:text-3xl font-bold">{data.classes}</p>
            </div>

            <FaSchool className="text-2xl md:text-3xl"/>

          </div>

        </div>



        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow hover:scale-105 transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm md:text-base">Total Subjects</p>
              <p className="text-2xl md:text-3xl font-bold">{data.subjects}</p>
            </div>

            <FaBook className="text-2xl md:text-3xl"/>

          </div>

        </div>


      </div>



      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        <div className="bg-white p-4 md:p-6 rounded-xl shadow">

          <h2 className="text-lg md:text-xl font-semibold mb-4">
            System Overview
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



        <div className="bg-white p-4 md:p-6 rounded-xl shadow">

          <h2 className="text-lg md:text-xl font-semibold mb-4">
            System Info
          </h2>

          <ul className="space-y-3 text-gray-600 text-sm md:text-base">

            <li>📚 Total Classes : {data.classes}</li>
            <li>👨‍🎓 Students Registered : {data.students}</li>
            <li>👨‍🏫 Teachers Registered : {data.teachers}</li>
            <li>📅 Academic Year : 2026</li>

          </ul>

        </div>


      </div>

    </div>

  );

}

export default AdminDashboard;