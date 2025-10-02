"use client";
import { User, Bell, Shield,  Download, Trash2 } from "lucide-react";

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
  },
  {
    id: 'data',
    title: 'Data & Privacy',
    icon: Download,
  },
  {
    id: 'account',
    title: 'Account',
    icon: Trash2,
  }
];

export default function Sidebar({ activeCategory, onCategoryChange }: { 
  activeCategory: string, 
  onCategoryChange: (category: string) => void 
}) {
  return (
    <div className="bg-white border-r  border-gray-200 p-6 h-auto w-[30%]">
      <nav className="space-y-1">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-150 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="font-medium text-sm">{category.title}</div>
              </div>
             
            </button>
          );
        })}
      </nav>
    </div>
  );
}