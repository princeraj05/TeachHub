const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const firebaseAdmin = require("../config/firebase");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../utils/emailService");


// ================= REGISTER =================

exports.register = async (req,res)=>{

try{

const {name,email,password,role} = req.body;


// check existing user

const existingUser = await User.findOne({email});

if(existingUser){
return res.status(400).json({
message:"User already exists"
});
}


// hash password

const hashedPassword = await bcrypt.hash(password,10);


// create user

const user = await User.create({
name,
email,
password:hashedPassword,
role
});


res.status(201).json({
message:"User Registered Successfully"
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= LOGIN =================

exports.login = async (req,res)=>{

try{

const {email,password} = req.body;


// check user

const user = await User.findOne({email});

if(!user){
return res.status(400).json({
message:"Invalid email or password"
});
}


// compare password

const isMatch = await bcrypt.compare(password,user.password);

if(!isMatch){
return res.status(400).json({
message:"Invalid email or password"
});
}


// generate token

const token = jwt.sign(
{
id:user._id,
role:user.role
},
process.env.JWT_SECRET,
{expiresIn:"7d"}
);


// response

res.json({

message:"Login Successful",
token,

user:{
_id:user._id,
name:user.name,
email:user.email,
role:user.role,
schoolName:user.schoolName || ""
}

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};


// ================= FIREBASE SYNC =================

exports.firebaseSync = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID Token is required" });
    }

    // Verify token with Firebase Admin
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: "Email not verified or not provided by Firebase" });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    const isSuperAdmin = email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();

    if (!user) {
      // Create user as unassigned by default
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        role: isSuperAdmin ? "superadmin" : "unassigned",
        schoolName: ""
      });
    } else {
      // If user exists and is supposed to be superadmin, force it
      if (isSuperAdmin && user.role !== "superadmin") {
        user.role = "superadmin";
        await user.save();
      }
    }

    // Sign custom JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolName: user.schoolName
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Sync Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName
      }
    });

  } catch (error) {
    console.error("Firebase sync error:", error);
    res.status(401).json({ message: "Invalid or expired Firebase token", error: error.message });
  }
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Cooldown check: prevent requesting more than once every 60 seconds
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeElapsed = Date.now() - new Date(existingOtp.createdAt).getTime();
      const cooldown = 60 * 1000; // 60 seconds cooldown
      if (timeElapsed < cooldown) {
        const secondsLeft = Math.ceil((cooldown - timeElapsed) / 1000);
        return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting a new OTP.` });
      }
    }

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Hash the OTP before saving to database
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({ email, otp: hashedOtp, expiresAt });

    // Send email
    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send verification email. Please check your credentials or try again later." });
    }

    res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Error in sendOTP:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Double check expiry
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "Too many invalid verification attempts. Please request a new code." });
      }
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete OTP so it cannot be reused
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });
    const isSuperAdmin = email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();

    if (!user) {
      // Create user as unassigned by default
      user = await User.create({
        name: email.split("@")[0],
        email,
        role: isSuperAdmin ? "superadmin" : "unassigned",
        schoolName: ""
      });
    } else {
      // Force superadmin role if email matches SUPER_ADMIN_EMAIL
      if (isSuperAdmin && user.role !== "superadmin") {
        user.role = "superadmin";
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolName: user.schoolName
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Verification and Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName
      }
    });

  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a fresh token with current role and schoolName
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolName: user.schoolName
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userObj = user.toObject();
    userObj.token = token;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      avatar,
      fatherMobileNumber,
      motherMobileNumber,
      alternateEmail,
      dob,
      gender,
      address,
      timezone,
      language,
      about,
      password
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      const bcrypt = require("bcryptjs");
      user.password = await bcrypt.hash(password, 10);
    }

    if (alternateEmail !== undefined) user.alternateEmail = alternateEmail;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (timezone !== undefined) user.timezone = timezone;
    if (language !== undefined) user.language = language;
    if (about !== undefined) user.about = about;

    const phonePattern = /^[0-9+()\-\s]{7,20}$/;
    if (fatherMobileNumber !== undefined) {
      if (fatherMobileNumber && !phonePattern.test(fatherMobileNumber)) return res.status(400).json({ message: "Father mobile number is invalid" });
      user.fatherMobileNumber = fatherMobileNumber;
    }
    if (motherMobileNumber !== undefined) {
      if (motherMobileNumber && !phonePattern.test(motherMobileNumber)) return res.status(400).json({ message: "Mother mobile number is invalid" });
      user.motherMobileNumber = motherMobileNumber;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName,
        phoneNumber: user.phoneNumber,
        alternateEmail: user.alternateEmail,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        timezone: user.timezone,
        language: user.language,
        about: user.about,
        fatherMobileNumber: user.fatherMobileNumber,
        motherMobileNumber: user.motherMobileNumber,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SCHOOLS =================
exports.getSchools = async (req, res) => {
  try {
    const schools = await User.distinct("schoolName", { schoolName: { $ne: "" } });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUBMIT JOIN REQUEST =================
exports.submitJoinRequest = async (req, res) => {
  try {
    const { schoolName, role } = req.body;

    if (!schoolName || !role) {
      return res.status(400).json({ message: "School name and role are required" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role requested. Must be student or teacher." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.requestedSchool || ["pending", "scheduled", "exam_completed"].includes(user.requestStatus)) {
      return res.status(400).json({ message: "You already have an active or pending join request. Please wait for the administrator to approve or reject your request." });
    }

    user.requestedSchool = schoolName;
    user.requestedRole = role;
    user.requestStatus = "pending";

    await user.save();

    res.json({
      message: "Join request submitted successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        requestedSchool: user.requestedSchool,
        requestedRole: user.requestedRole,
        requestStatus: user.requestStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGOUT ACTION =================
exports.logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
