"use client";
import { useAuth } from "../../context/authProvider";
import ProfileLayout from "./layout";

function ProfilePage() {
  const { user } = useAuth();
  console.log("picture", user?.picture);

  return <ProfileLayout />; // No need for activeTab prop anymore
}

export default ProfilePage;