import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
FaTachometerAlt,
FaUserGraduate,
FaClipboardCheck,
FaBook,
FaCalendarAlt,
FaAngleDown,
FaSignOutAlt,
FaSchool
} from "react-icons/fa";

function TeacherLayout() {

const navigate = useNavigate();

const [studentsOpen, setStudentsOpen] = useState(false);
const [attendanceOpen, setAttendanceOpen] = useState(false);

const name = localStorage.getItem("name") || "Teacher";

const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");
navigate("/");
};

return (

<div className="flex min-h-screen bg-gray-100">

{/* Sidebar */}

<div className="w-64 bg-slate-900 text-white p-4 flex flex-col justify-between">

<div>

<h2 className="text-xl font-bold mb-6">
MySchool Teacher
</h2>

<nav className="space-y-2">

<Link
to="/teacher/dashboard"
className="flex items-center gap-3 p-2 rounded hover:bg-slate-700"
>
<FaTachometerAlt/>
Dashboard
</Link>

<Link
to="/teacher/my-classes"
className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded"
>
<FaSchool/>
My Classes
</Link>


<button
onClick={()=>setStudentsOpen(!studentsOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"
>

<span className="flex items-center gap-3">
<FaUserGraduate/>
Students
</span>

<FaAngleDown/>

</button>

{studentsOpen && (

<div className="ml-6 space-y-1">

<Link
to="/teacher/my-students"
className="p-2 block hover:bg-slate-700 rounded"
>
My Students
</Link>

</div>

)}


<button
onClick={()=>setAttendanceOpen(!attendanceOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"
>

<span className="flex items-center gap-3">
<FaClipboardCheck/>
Attendance
</span>

<FaAngleDown/>

</button>

{attendanceOpen && (

<div className="ml-6 space-y-1">

<Link
to="/teacher/mark-attendance"
className="p-2 block hover:bg-slate-700 rounded"
>
Mark Attendance
</Link>

<Link
to="/teacher/attendance-report"
className="p-2 block hover:bg-slate-700 rounded"
>
Attendance Report
</Link>

</div>

)}


<Link
to="/teacher/my-subjects"
className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded"
>
<FaBook/>
My Subjects
</Link>

<Link
to="/teacher/exam-schedule"
className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded"
>
<FaCalendarAlt/>
Exam Schedule
</Link>

</nav>

</div>


<button
onClick={handleLogout}
className="flex items-center gap-3 p-2 bg-red-600 hover:bg-red-700 rounded"
>
<FaSignOutAlt/>
Logout
</button>

</div>


{/* MAIN SECTION */}

<div className="flex-1 flex flex-col">


{/* TOP NAVBAR */}

<div className="flex justify-between items-center bg-white px-6 py-3 shadow">

<h2 className="font-semibold text-lg">
Teacher Panel
</h2>

<div
onClick={()=>navigate("/teacher/profile")}
className="flex items-center gap-3 cursor-pointer"
>

<p className="text-gray-700">
Welcome, <span className="font-semibold">{name}</span>
</p>

<div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">

{name.charAt(0).toUpperCase()}

</div>

</div>

</div>


{/* Page Content */}

<div className="p-6 flex-1">

<Outlet/>

</div>

</div>

</div>

);

}

export default TeacherLayout;