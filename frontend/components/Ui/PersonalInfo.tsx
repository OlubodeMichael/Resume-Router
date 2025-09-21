import PersonalInfoCard from "../Cards/personalInfo";

export default function PersonalInfo() {
  return (
    <div className="min-h-screen">
      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-12">
        <div className="py-6 sm:py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Personal Information</h1>
            <p className="text-sm sm:text-base text-gray-600">Add your personal information to your profile.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <PersonalInfoCard />
        </div>
      </div>
    </div>
  );
}