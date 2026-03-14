import { useEffect, useState } from "react";
import axios from "axios";

function MarkAttendance() {

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= FETCH STUDENTS =================
  useEffect(() => {

    const fetchStudents = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/teacher/my-students",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStudents(res.data);
        setLoading(false);

      } catch (err) {

        console.log(err);
        setLoading(false);

      }

    };

    fetchStudents();

  }, []);



  // ================= HANDLE CHANGE =================
  const handleChange = (studentId, status) => {

    setAttendance({
      ...attendance,
      [studentId]: status
    });

  };



  // ================= SAVE ATTENDANCE =================
  const handleSubmit = async () => {

  try {

    const token = localStorage.getItem("token");

    for (const studentId in attendance) {

      const student = students.find(s => s._id === studentId);

      await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          student: studentId,
          classId: student.class,
          status: attendance[studentId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    }

    alert("Attendance saved successfully");

  } catch (err) {

    console.log(err.response?.data || err.message);

  }

};



  return (

    <div>

      <h1 className="text-2xl font-bold mb-4">
        Mark Attendance
      </h1>


      {loading ? (

        <p>Loading students...</p>

      ) : students.length === 0 ? (

        <p>No students found</p>

      ) : (

        <table className="w-full bg-white shadow">

          <thead className="bg-gray-200">

            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Present</th>
              <th className="p-2">Absent</th>
            </tr>

          </thead>

          <tbody>

            {students.map((s) => (

              <tr key={s._id} className="border">

                <td className="p-2">
                  {s.name}
                </td>

                <td className="p-2 text-center">
                  <input
                    type="radio"
                    name={s._id}
                    onChange={() => handleChange(s._id, "Present")}
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="radio"
                    name={s._id}
                    onChange={() => handleChange(s._id, "Absent")}
                  />
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}



      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Attendance
      </button>

    </div>

  );

}

export default MarkAttendance;