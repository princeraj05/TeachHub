const School = require("../models/School");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Helper to normalize name
const normalizeName = (name) => {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

// GET /api/schools
exports.getSchools = async (req, res) => {
  try {
    // Self-cleaning duplicate check: Clean up misspelled G.D Accedmy and migrate to correct G.D Academy
    await School.deleteOne({ name: { $in: ["G.D Accedmy", "G.D Accedmy ", "G.D Accedmy"] } });
    await School.deleteOne({ normalizedName: "g.d accedmy" });
    
    // Migrate users/classes/subjects referencing the misspelled school
    await User.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });
    await User.updateMany({ requestedSchool: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { requestedSchool: "G.D Academy" });
    await Class.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });
    await Subject.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });

    const schools = await School.find({}).sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/schools/my-school
exports.getMySchool = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).select("role schoolName").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can access their school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school = await School.findOne({
      $or: [
        { normalizedName: normalized },
        { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }
      ]
    });
    if (!school) {
      school = new School({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    } else if (!school.normalizedName) {
      school.normalizedName = normalized;
    }

    // Auto-seed example data if not filled (matching the mockup images exactly)
    let modified = false;
    if (!school.principalName) { school.principalName = "Banny Thapar"; modified = true; }
    if (!school.email) { school.email = "gdaccedmy@gmail.com"; modified = true; }
    if (!school.phoneNumber) { school.phoneNumber = "+91 98765 43210"; modified = true; }
    if (!school.address) { school.address = "Near Sadar Hospital, Siwan, Bihar - 841226, India"; modified = true; }
    if (!school.established) { school.established = "2010"; modified = true; }
    if (!school.code) { school.code = "GDAC2026"; modified = true; }
    if (!school.affiliation) { school.affiliation = "CBSE"; modified = true; }
    if (!school.academicYear) { school.academicYear = "2026 - 2027"; modified = true; }
    if (!school.medium) { school.medium = "English"; modified = true; }
    if (!school.website) { school.website = "www.gdaccedmy.edu.in"; modified = true; }
    if (!school.status) { school.status = "Active"; modified = true; }
    if (!school.registrationNumber) { school.registrationNumber = "GD/REG/2010/4125"; modified = true; }
    if (!school.category) { school.category = "Secondary"; modified = true; }
    if (!school.motto) { school.motto = "Learn • Grow • Succeed"; modified = true; }
    if (!school.photo) { school.photo = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&h=200&q=80"; modified = true; }
    
    // Categories / Facilities
    if (!school.academicLevel) { school.academicLevel = "Secondary"; modified = true; }
    if (!school.coEducational) { school.coEducational = "Co-Educational"; modified = true; }
    if (!school.schoolOperationType) { school.schoolOperationType = "Day School"; modified = true; }
    if (!school.admissionType) { school.admissionType = "Direct Admission"; modified = true; }
    if (!school.transportation) { school.transportation = "Available"; modified = true; }
    if (!school.hostelFacility) { school.hostelFacility = "Not Available"; modified = true; }
    if (!school.availableClasses) { school.availableClasses = "Class 1 to 10"; modified = true; }

    if (!school.coverImage) {
      school.coverImage = "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80";
      modified = true;
    }
    if (!school.schoolPhotos || school.schoolPhotos.length === 0) {
      school.schoolPhotos = [
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80", // school front
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80", // campus garden
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80", // classroom
        "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80", // library
        "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=400&q=80"  // school bus
      ];
      modified = true;
    }
    if (!school.principalPhoto) {
      school.principalPhoto = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80";
      modified = true;
    }
    if (!school.principalDesignation) { school.principalDesignation = "Head of Institution"; modified = true; }
    if (!school.principalEmail) { school.principalEmail = "banny.thapar@gdaccedmy.edu.in"; modified = true; }
    if (!school.principalPhone) { school.principalPhone = "+91 98765 43210"; modified = true; }
    if (!school.principalLeadershipSince) { school.principalLeadershipSince = "2018-08-15"; modified = true; }
    if (!school.principalIntroduction) {
      school.principalIntroduction = "With over 20 years of experience in the field of education, I am committed to providing quality education and overall development of our students.";
      modified = true;
    }
    if (!school.schoolCategoriesList || school.schoolCategoriesList.length === 0) {
      school.schoolCategoriesList = ["Primary", "Secondary", "Co-Educational", "Residential"];
      modified = true;
    }
    if (!school.admissionProcess) { school.admissionProcess = "Direct Admission"; modified = true; }
    if (!school.schoolBoardType) { school.schoolBoardType = "Private"; modified = true; }
    if (school.teacherAppointmentBooking === undefined || school.teacherAppointmentBooking === null) {
      school.teacherAppointmentBooking = true;
      modified = true;
    }
    if (!school.appointmentBookingType) { school.appointmentBookingType = "Online Booking"; modified = true; }
    if (!school.appointmentAdvanceDays) { school.appointmentAdvanceDays = 7; modified = true; }
    if (!school.appointmentMaxPerDay) { school.appointmentMaxPerDay = 5; modified = true; }
    if (!school.appointmentDuration) { school.appointmentDuration = 30; modified = true; }
    if (!school.workingDays || school.workingDays.length === 0) {
      school.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      modified = true;
    }
    if (!school.openingTime) { school.openingTime = "08:00 AM"; modified = true; }
    if (!school.closingTime) { school.closingTime = "04:00 PM"; modified = true; }
    if (!school.holidays || school.holidays.length === 0) {
      school.holidays = [
        { date: "15 Aug", name: "Independence Day" },
        { date: "05 Sep", name: "Teachers' Day" },
        { date: "02 Oct", name: "Gandhi Jayanti" }
      ];
      modified = true;
    }
    if (!school.description) {
      school.description = `<h3><strong>G.D Academy</strong></h3><p>G.D Academy is a reputed educational institution committed to providing quality education in a safe, supportive, and engaging learning environment.</p><p>Our school focuses on the overall development of students by combining strong academic foundations with discipline, creativity, sports, and extracurricular activities.</p><p>With dedicated and experienced teachers, modern learning facilities, and a student-centered approach, we encourage students to develop confidence, critical thinking, communication skills, and strong moral values.</p><p>Our mission is to prepare students for academic success as well as future challenges by nurturing responsible, knowledgeable, and well-rounded individuals.</p><h4><strong>Our Vision</strong></h4><p>To be a leading institution that inspires students to learn, grow, and succeed in all areas of life.</p><h4><strong>Our Mission</strong></h4><ul><li>Provide quality education with modern teaching methodologies.</li><li>Encourage creativity, innovation, and critical thinking.</li><li>Promote sports, culture, and extracurricular excellence.</li><li>Build strong values and responsible citizens.</li></ul>`;
      modified = true;
    }

    if (modified || school.isNew) {
      await school.save();
    }

    // Fetch dynamic counts in parallel
    const [
      dynamicStudentsCount,
      dynamicTeachersCount,
      dynamicClassesCount,
      dynamicSubjectsCount
    ] = await Promise.all([
      User.countDocuments({ role: "student", schoolName }),
      User.countDocuments({ role: "teacher", schoolName }),
      Class.countDocuments({ schoolName }),
      Subject.countDocuments({ schoolName })
    ]);

    const schoolObj = school.toObject();
    schoolObj.totalStudents = dynamicStudentsCount || 0;
    schoolObj.totalTeachers = dynamicTeachersCount || 0;
    schoolObj.totalClasses = dynamicClassesCount || 0;
    schoolObj.totalSubjects = dynamicSubjectsCount || 0;

    res.json(schoolObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/schools/my-school
exports.updateMySchool = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).select("role schoolName").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can update school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school = await School.findOne({
      $or: [
        { normalizedName: normalized },
        { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }
      ]
    });
    if (!school) {
      school = new School({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    } else if (!school.normalizedName) {
      school.normalizedName = normalized;
    }

    const {
      principalName,
      availableClasses,
      schoolTypes,
      schoolType,
      teacherAppointmentBooking,
      appointmentMode,
      appointmentDetails,
      admissionExam,
      directAdmission,
      description,
      
      email,
      phoneNumber,
      address,
      established,
      code,
      affiliation,
      academicYear,
      medium,
      website,
      status,
      registrationNumber,
      category,
      motto,
      photo,
      academicLevel,
      coEducational,
      schoolOperationType,
      admissionType,
      transportation,
      hostelFacility,

      // Multi-tab fields
      coverImage,
      schoolPhotos,
      principalPhoto,
      principalDesignation,
      principalEmail,
      principalPhone,
      principalLeadershipSince,
      principalIntroduction,
      schoolCategoriesList,
      admissionProcess,
      schoolBoardType,
      appointmentBookingType,
      appointmentAdvanceDays,
      appointmentMaxPerDay,
      appointmentDuration,
      workingDays,
      openingTime,
      closingTime,
      holidays
    } = req.body;

    if (principalName !== undefined) school.principalName = principalName;
    if (availableClasses !== undefined) school.availableClasses = availableClasses;
    if (schoolTypes !== undefined) school.schoolTypes = schoolTypes;
    if (schoolType !== undefined) school.schoolType = schoolType;
    
    if (teacherAppointmentBooking !== undefined) school.teacherAppointmentBooking = Boolean(teacherAppointmentBooking);
    if (appointmentMode !== undefined) school.appointmentMode = appointmentMode;
    if (appointmentDetails !== undefined) school.appointmentDetails = String(appointmentDetails).slice(0, 1000);
    if (admissionExam !== undefined) school.admissionExam = admissionExam;
    if (directAdmission !== undefined) school.directAdmission = directAdmission;
    if (description !== undefined) school.description = description;

    // Save extended fields
    if (email !== undefined) school.email = email;
    if (phoneNumber !== undefined) school.phoneNumber = phoneNumber;
    if (address !== undefined) school.address = address;
    if (established !== undefined) school.established = established;
    if (code !== undefined) school.code = code;
    if (affiliation !== undefined) school.affiliation = affiliation;
    if (academicYear !== undefined) school.academicYear = academicYear;
    if (medium !== undefined) school.medium = medium;
    if (website !== undefined) school.website = website;
    if (status !== undefined) school.status = status;
    if (registrationNumber !== undefined) school.registrationNumber = registrationNumber;
    if (category !== undefined) school.category = category;
    if (motto !== undefined) school.motto = motto;
    if (photo !== undefined) school.photo = photo;

    // School Categories / Facilities
    if (academicLevel !== undefined) school.academicLevel = academicLevel;
    if (coEducational !== undefined) school.coEducational = coEducational;
    if (schoolOperationType !== undefined) school.schoolOperationType = schoolOperationType;
    if (admissionType !== undefined) school.admissionType = admissionType;
    if (transportation !== undefined) school.transportation = transportation;
    if (hostelFacility !== undefined) school.hostelFacility = hostelFacility;

    // Multi-tab fields
    if (coverImage !== undefined) school.coverImage = coverImage;
    if (schoolPhotos !== undefined) school.schoolPhotos = schoolPhotos;
    if (principalPhoto !== undefined) school.principalPhoto = principalPhoto;
    if (principalDesignation !== undefined) school.principalDesignation = principalDesignation;
    if (principalEmail !== undefined) school.principalEmail = principalEmail;
    if (principalPhone !== undefined) school.principalPhone = principalPhone;
    if (principalLeadershipSince !== undefined) school.principalLeadershipSince = principalLeadershipSince;
    if (principalIntroduction !== undefined) school.principalIntroduction = principalIntroduction;
    if (schoolCategoriesList !== undefined) school.schoolCategoriesList = schoolCategoriesList;
    if (admissionProcess !== undefined) school.admissionProcess = admissionProcess;
    if (schoolBoardType !== undefined) school.schoolBoardType = schoolBoardType;
    if (appointmentBookingType !== undefined) school.appointmentBookingType = appointmentBookingType;
    if (appointmentAdvanceDays !== undefined) school.appointmentAdvanceDays = Number(appointmentAdvanceDays);
    if (appointmentMaxPerDay !== undefined) school.appointmentMaxPerDay = Number(appointmentMaxPerDay);
    if (appointmentDuration !== undefined) school.appointmentDuration = Number(appointmentDuration);
    if (workingDays !== undefined) school.workingDays = workingDays;
    if (openingTime !== undefined) school.openingTime = openingTime;
    if (closingTime !== undefined) school.closingTime = closingTime;
    if (holidays !== undefined) school.holidays = holidays;

    await school.save();

    // Re-query counts to return matching shape
    const dynamicStudentsCount = await User.countDocuments({ role: "student", schoolName });
    const dynamicTeachersCount = await User.countDocuments({ role: "teacher", schoolName });
    const dynamicClassesCount = await Class.countDocuments({ schoolName });
    const dynamicSubjectsCount = await Subject.countDocuments({ schoolName });

    const schoolObj = school.toObject();
    schoolObj.totalStudents = dynamicStudentsCount || 0;
    schoolObj.totalTeachers = dynamicTeachersCount || 0;
    schoolObj.totalClasses = dynamicClassesCount || 0;
    schoolObj.totalSubjects = dynamicSubjectsCount || 0;

    res.json({ message: "School information updated successfully", school: schoolObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/:name
exports.getSchoolDetails = async (req, res) => {
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/:name/teachers
exports.getSchoolTeachers = async (req, res) => {
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const teachers = await User.find({ role: "teacher", schoolName: school.name })
      .select("-password")
      .lean();

    for (let teacher of teachers) {
      const classes = await Class.find({ teacher: teacher._id, schoolName: school.name }).select("name section");
      const subjects = await Subject.find({ teacher: teacher._id, schoolName: school.name }).select("name");
      teacher.classes = classes;
      teacher.subjects = subjects;
    }

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /api/schools/upload
exports.uploadSchoolPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fs = require("fs");

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const cloudinary = require("../config/cloudinary");
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "teachhub_schools",
        });
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.json({ url: result.secure_url });
      } catch (cErr) {
        console.error("Cloudinary upload failed, falling back to local static URL:", cErr.message);
      }
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    const fs = require("fs");
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};
