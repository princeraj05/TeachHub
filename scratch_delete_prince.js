const path = require("path");
const backendDir = path.join(__dirname, "backend");

const dotenv = require(path.join(backendDir, "node_modules", "dotenv"));
dotenv.config({ path: path.join(backendDir, ".env") });

const mongoose = require(path.join(backendDir, "node_modules", "mongoose"));
const User = require(path.join(backendDir, "models", "User"));

async function findAndDeleteUser() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in .env");
      process.exit(1);
    }
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    const email = "princefullstack0324@gmail.com";
    const name = "prince raj";

    // Search by exact email or name matching the screenshot
    const filter = {
      $or: [
        { email: new RegExp("^" + email.trim() + "$", "i") },
        { name: new RegExp("^" + name.trim() + "$", "i") }
      ]
    };

    const users = await User.find(filter);

    console.log(`Found ${users.length} matching user record(s):`);
    users.forEach(u => {
      console.log(`- ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Status: ${u.requestStatus} | School: ${u.requestedSchool || u.schoolName}`);
    });

    if (users.length > 0) {
      const deleteResult = await User.deleteMany(filter);
      console.log("Delete Operation Result:", deleteResult);
      console.log(`SUCCESS: ${deleteResult.deletedCount} user record(s) deleted from MongoDB.`);
    } else {
      console.log("No user found with the given email/name.");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Database error:", err);
  }
}

findAndDeleteUser();
