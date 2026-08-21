const User = require("../models/User");

// GET /api/superadmin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, schoolName, search } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }
    if (schoolName) {
      query.schoolName = schoolName;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .populate("classId", "name section")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/superadmin/assign-role
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, schoolName } = req.body;

    const allowedRoles = ["admin", "teacher", "student", "unassigned"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot change Super Admin role" });
    }

    user.role = role;
    user.schoolName = (role === "unassigned") ? "" : schoolName || "";

    if (role !== "student") {
      user.classId = null; // Reset class if no longer a student
    }

    await user.save();

    res.json({
      message: "User role/school assigned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/superadmin/schools
exports.getSchools = async (req, res) => {
  try {
    // Derive unique schools from users who are admins
    const schools = await User.distinct("schoolName", { schoolName: { $ne: "" } });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/superadmin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Class = require("../models/Class");
    const Subject = require("../models/Subject");
    const Attendance = require("../models/Attendance");

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot delete a Super Admin" });
    }

    const userId = user._id;

    // Clean up references
    await Class.updateMany({ students: userId }, { $pull: { students: userId } });
    await Class.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Subject.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Attendance.deleteMany({ student: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
