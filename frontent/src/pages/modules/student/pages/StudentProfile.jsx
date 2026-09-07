import UserProfile from "../../../../components/UserProfile";

const SORA = "'Sora', sans-serif";

function StudentProfile() {
  return (
    <div style={{ fontFamily: SORA }} className="max-w-4xl mx-auto py-2">
      <UserProfile />
    </div>
  );
}

export default StudentProfile;