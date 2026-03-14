import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
FaTachometerAlt,
FaBook,
FaClipboardCheck,
FaFileAlt,
FaUser,
FaSignOutAlt
} from "react-icons/fa";

function StudentLayout() {

const navigate = useNavigate();

const name = localStorage.getItem("name") || "Student";

return (

<div className="flex min-h-screen bg-gray-100">

{/* Sidebar */}

<div className="w-64 bg-blue-900 text-white flex flex-col">

<h2 className="text-xl font-bold p-6 border-b border-blue-700">
Student Panel
</h2>

<nav className="flex-1 p-4 space-y-2">

<NavLink
to="/student/dashboard"
className="flex items-center gap-3 p-3 rounded hover:bg-blue-700"
>
<FaTachometerAlt />
Dashboard
</NavLink>

<NavLink
to="/student/subjects"
className="flex items-center gap-3 p-3 rounded hover:bg-blue-700"
>
<FaBook />
My Subjects
</NavLink>

<NavLink
to="/student/attendance"
className="flex items-center gap-3 p-3 rounded hover:bg-blue-700"
>
<FaClipboardCheck />
My Attendance
</NavLink>

<NavLink
to="/student/exams"
className="flex items-center gap-3 p-3 rounded hover:bg-blue-700"
>
<FaFileAlt />
My Exams
</NavLink>

<NavLink
to="/student/profile"
className="flex items-center gap-3 p-3 rounded hover:bg-blue-700"
>
<FaUser />
Profile
</NavLink>

<button
onClick={()=>{
localStorage.clear();
navigate("/");
}}
className="flex items-center gap-3 p-3 rounded hover:bg-red-600 w-full text-left"
>

<FaSignOutAlt />
Logout

</button>

</nav>

</div>


{/* Main Section */}

<div className="flex-1 flex flex-col">

{/* Topbar */}

<div className="flex justify-between items-center bg-white px-6 py-3 shadow">

<h2 className="font-semibold text-lg">
Student Panel
</h2>

<div
onClick={()=>navigate("/student/profile")}
className="flex items-center gap-3 cursor-pointer"
>

<p className="text-gray-700">
Welcome, <span className="font-semibold">{name}</span>
</p>

<div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
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

export default StudentLayout;