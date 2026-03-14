import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post(
        `${API}/api/auth/login`,
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "student") {
        navigate("/student/dashboard");
      } 
      else if (res.data.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } 
      else if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      }

    } catch (error) {

      alert(error.response?.data?.message || "Login Failed");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          MySchool
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400"/>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400"/>

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={()=>setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash/> : <FaEye/>}
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register Here
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;