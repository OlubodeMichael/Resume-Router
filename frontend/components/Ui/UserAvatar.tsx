"use client";
import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm", 
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-xl"
};

export default function UserAvatar({
  src,
  alt,
  name,
  email,
  size = "md",
  className = ""
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  
  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Show image if src is provided and valid
  if (src && src.trim() !== "") {
    return (
      <div className={`${sizeClass} rounded-full border-2 border-gray-200 object-cover shadow-sm flex-shrink-0 overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt || name || email || 'User'}
          width={size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 80}
          height={size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 80}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  // Show initials if no image
  return (
    <div className={`${sizeClass} rounded-full border-2 border-gray-200 bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0 font-semibold ${className}`}>
      {getInitials()}
    </div>
  );
}