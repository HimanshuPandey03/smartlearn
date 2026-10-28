import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getDashboardLink = () => {
    if (!userProfile) return '/student';
    if (userProfile.role === 'admin') return '/admin';
    if (userProfile.role === 'teacher') return '/teacher';
    return '/student';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-secondary">SmartLearn</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary font-medium">Home</Link>
            <Link to="/about" className="text-slate-600 hover:text-primary font-medium">About</Link>
            <Link to="/features" className="text-slate-600 hover:text-primary font-medium">Features</Link>
            <Link to="/contact" className="text-slate-600 hover:text-primary font-medium">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                   <LogOut size={18} /> Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-primary focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Home</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">About</Link>
            <Link to="/features" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Features</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Contact</Link>
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2 px-3">
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" fullWidth onClick={() => navigate('/login')}>Login</Button>
                  <Button fullWidth onClick={() => navigate('/register')}>Get Started</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" fullWidth onClick={() => navigate(getDashboardLink())}>Dashboard</Button>
                  <Button fullWidth onClick={handleLogout}>Logout</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
