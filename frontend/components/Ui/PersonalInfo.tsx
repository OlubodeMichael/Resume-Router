import { UserIcon } from "lucide-react";

export default function PersonalInfo() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Name</h3>
            <p className="text-sm text-gray-500">John Doe</p>
          </div>
        </div>
      </div>
    </div>
  );
}