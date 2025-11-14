"use client";

import React from 'react';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      {children}
    </div>
  );
}

export default AdminLayout;