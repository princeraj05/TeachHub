const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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