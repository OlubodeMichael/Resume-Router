"use client";
import { useAuth } from "../../context/authProvider";
import SideBar from "@/components/Ui/SideBar";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import Profile from "@/components/Ui/Profile";
import PersonalInfo from "@/components/Ui/PersonalInfo";

function ProfileLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const navItems = [
    {
      label: "Profile",
      icon: <UserIcon />,
    },
    {
      label: "Personal Info",
      icon: <UserIcon />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
      <div className="w-96 flex-shrink-0 p-6">
        <SideBar
          name={user?.name || ""}
          navItems={navItems}
          onItemClick={setActiveTab}
          avatarUrl={user?.picture || ""}
          activeTab={activeTab}
        />
      </div>
      <div className="flex-1 p-6">
        {activeTab === "Profile" ? <Profile /> : <PersonalInfo />}
      </div>
    </div>
  );
}

export default ProfileLayout;

