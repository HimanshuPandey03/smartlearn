import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (!loading && isAuthenticated) {
    if (userProfile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (userProfile?.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="font-bold text-3xl text-secondary">SmartLearn</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
