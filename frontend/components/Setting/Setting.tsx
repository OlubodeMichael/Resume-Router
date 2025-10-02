"use client";

import { useState } from "react";
import SettingCard from "./SettingCard";
import Sidebar from "./Sidebar";

export default function Setting() {
    const [activeCategory, setActiveCategory] = useState('profile');

    return (
        <div className="bg-gray-50 flex flex-row h-full">
            <Sidebar 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
            />
            <div className="flex-1">
                <SettingCard activeCategory={activeCategory} />
            </div>
        </div>
    )
}