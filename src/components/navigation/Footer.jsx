import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">SmartLearn</span>
            </Link>
            <p className="text-sm">
              Empowering students through structured digital learning, MS-CIT preparation, and employability skills.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/features" className="hover:text-white transition">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <p className="text-sm mb-2">Matrubhoomi School</p>
            <p className="text-sm mb-2">Thakur Village, Kandivali East</p>
            <p className="text-sm">Mumbai, India</p>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Learning and Skill Support Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
