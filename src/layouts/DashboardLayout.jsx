import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Menu, X, LayoutDashboard, Book, CheckSquare, 
  Award, TrendingUp, User, Users, FileText, Settings, LogOut, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = {
    student: [
      { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
      { name: 'Notes & Materials', path: '/student/materials', icon: <FileText size={20} /> },
      { name: 'Quizzes', path: '/student/quizzes', icon: <CheckSquare size={20} /> },
      { name: 'Courses', path: '/student/courses', icon: <Book size={20} /> },
      { name: 'Profile', path: '/student/profile', icon: <User size={20} /> },
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={20} /> },
      { name: 'Upload & Manage Notes', path: '/teacher/notes', icon: <FileText size={20} /> },
      { name: 'Create & Manage Quizzes', path: '/teacher/quizzes', icon: <CheckSquare size={20} /> },
      { name: 'Courses', path: '/teacher/content', icon: <Book size={20} /> },
      { name: 'Profile', path: '/teacher/profile', icon: <User size={20} /> },
    ],
    admin: [
      { name: 'Dashboard (Overview)', path: '/admin', icon: <LayoutDashboard size={20} /> },
      { name: 'All Quizzes', path: '/admin/quizzes', icon: <CheckSquare size={20} /> },
      { name: 'All Notes', path: '/admin/notes', icon: <FileText size={20} /> },
      { name: 'All Users', path: '/admin/users', icon: <Users size={20} /> },
      { name: 'Courses', path: '/admin/courses', icon: <Book size={20} /> },
    ]
  };

  const currentNav = navItems[role] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-800/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between lg:justify-center">
          <Link to={`/${role}`} className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-secondary">SmartLearn</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {currentNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {userProfile?.name || 'User'}
              </span>
              <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                {role === 'student' ? 'S' : role === 'teacher' ? 'T' : 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
