import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
