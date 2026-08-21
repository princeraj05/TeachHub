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
role:user.role
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

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({ email, otp, expiresAt });

    // Send email
    const emailResult = await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
      development: emailResult.development,
      otp: emailResult.development ? otp : undefined
    });

  } catch (error) {
    console.error("Error in sendOTP:", error);
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

    // Verify OTP
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Double check expiry
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
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