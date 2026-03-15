import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
FaTachometerAlt,
FaUsers,
FaUserGraduate,
FaChalkboardTeacher,
FaBook,
FaClipboardList,
FaChartBar,
FaCalendarAlt,
FaUserCircle,
FaAngleDown,
FaSignOutAlt,
FaBars
} from "react-icons/fa";

function AdminLayout() {

const navigate = useNavigate();

const [usersOpen, setUsersOpen] = useState(false);
const [academicsOpen, setAcademicsOpen] = useState(false);
const [assignOpen, setAssignOpen] = useState(false);
const [reportOpen, setReportOpen] = useState(false);
const [menuOpen,setMenuOpen] = useState(false);

const name = localStorage.getItem("name") || "Admin";

const handleLogout = () => {
localStorage.clear();
navigate("/login");
};

const closeMenu = () => {
setMenuOpen(false);
};

return (

<div className="flex min-h-screen bg-gray-100 overflow-hidden">

{/* MOBILE OVERLAY */}

{menuOpen && (

<div
className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
onClick={()=>setMenuOpen(false)}
></div>
)}

{/* SIDEBAR */}

<div
className={`
fixed md:static top-0 left-0 h-full w-64 bg-slate-900 text-white p-4
flex flex-col justify-between
transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}
md:translate-x-0
transition-transform duration-300
z-50
`}
>

<div className="overflow-y-auto">

<h2 className="text-xl font-bold mb-6">
MySchool Admin
</h2>

<nav className="space-y-2">

<Link onClick={closeMenu}
to="/admin/dashboard"
className="flex items-center gap-3 p-2 rounded hover:bg-slate-700">
<FaTachometerAlt/> Dashboard
</Link>

{/* USERS */}

<button
onClick={()=>setUsersOpen(!usersOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"

>

<span className="flex items-center gap-3">
<FaUsers/> Users
</span>
<FaAngleDown/>
</button>

{usersOpen && (

<div className="ml-6 space-y-1">

<Link onClick={closeMenu}
to="/admin/teachers"
className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded">
<FaChalkboardTeacher/> Teachers
</Link>

<Link onClick={closeMenu}
to="/admin/students"
className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded">
<FaUserGraduate/> Students
</Link>

</div>

)}

{/* ACADEMICS */}

<button
onClick={()=>setAcademicsOpen(!academicsOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"

>

<span className="flex items-center gap-3">
<FaBook/> Academics
</span>
<FaAngleDown/>
</button>

{academicsOpen && (

<div className="ml-6 space-y-1">

<Link onClick={closeMenu}
to="/admin/classes"
className="p-2 block hover:bg-slate-700 rounded">
Classes
</Link>

<Link onClick={closeMenu}
to="/admin/subjects"
className="p-2 block hover:bg-slate-700 rounded">
Subjects
</Link>

</div>

)}

{/* ASSIGN */}

<button
onClick={()=>setAssignOpen(!assignOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"

>

<span className="flex items-center gap-3">
<FaClipboardList/> Assignments
</span>
<FaAngleDown/>
</button>

{assignOpen && (

<div className="ml-6 space-y-1">

<Link onClick={closeMenu}
to="/admin/assign-teacher-class"
className="p-2 block hover:bg-slate-700 rounded">
Assign Teacher
</Link>

<Link onClick={closeMenu}
to="/admin/assign-student-class"
className="p-2 block hover:bg-slate-700 rounded">
Assign Student
</Link>

<Link onClick={closeMenu}
to="/admin/assign-subject-teacher"
className="p-2 block hover:bg-slate-700 rounded">
Assign Subject
</Link>

</div>

)}

{/* REPORTS */}

<button
onClick={()=>setReportOpen(!reportOpen)}
className="flex items-center justify-between w-full p-2 hover:bg-slate-700 rounded"

>

<span className="flex items-center gap-3">
<FaChartBar/> Reports
</span>
<FaAngleDown/>
</button>

{reportOpen && (

<div className="ml-6 space-y-1">

<Link onClick={closeMenu}
to="/admin/attendance-report"
className="p-2 block hover:bg-slate-700 rounded">
Attendance Report
</Link>

<Link onClick={closeMenu}
to="/admin/exam-results"
className="p-2 block hover:bg-slate-700 rounded">
Exam Results
</Link>

</div>

)}

<Link onClick={closeMenu}
to="/admin/exam-schedule"
className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded">
<FaCalendarAlt/> Exam Schedule
</Link>

<Link onClick={closeMenu}
to="/admin/profile"
className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded">
<FaUserCircle/> Profile
</Link>

</nav>

</div>

<button
onClick={handleLogout}
className="flex items-center gap-3 p-2 bg-red-600 hover:bg-red-700 rounded mt-4"> <FaSignOutAlt/> Logout </button>

</div>

{/* MAIN SECTION */}

<div className="flex-1 flex flex-col min-w-0">

{/* TOP NAVBAR */}

<div className="flex justify-between items-center bg-white px-4 md:px-6 py-3 shadow">

<div className="flex items-center gap-3">

<button
className="md:hidden text-xl"
onClick={()=>setMenuOpen(!menuOpen)}> <FaBars/> </button>

<h2 className="font-semibold text-lg">
Admin Panel
</h2>

</div>

<div
onClick={()=>navigate("/admin/profile")}
className="flex items-center gap-3 cursor-pointer">

<p className="text-gray-700 hidden sm:block">
Welcome, <span className="font-semibold">{name}</span>
</p>

<div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
{name.charAt(0).toUpperCase()}
</div>

</div>

</div>

{/* PAGE CONTENT */}

<div className="p-4 md:p-6 flex-1 overflow-x-auto">

<Outlet/>

</div>

</div>

</div>

);

}

export default AdminLayout;
