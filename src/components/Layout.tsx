import React from 'react';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  );
}; 