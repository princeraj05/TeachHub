import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      alert("Registered Successfully");
      navigate("/");

    } catch (error) {

      alert(error.response?.data?.message || "Error");

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Register to MySchool
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="relative">

            <FaUser className="absolute top-3 left-3 text-gray-400"/>

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          {/* Email */}
          <div className="relative">

            <FaEnvelope className="absolute top-3 left-3 text-gray-400"/>

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          {/* Password */}
          <div className="relative">

            <FaLock className="absolute top-3 left-3 text-gray-400"/>

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          {/* Role */}
          <select
            name="role"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Register
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;