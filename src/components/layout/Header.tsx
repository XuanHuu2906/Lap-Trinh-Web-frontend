import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, HelpCircle, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-extrabold tracking-widest text-slate-900 font-sans">
              HIREARCH <span className="text-slate-500 font-medium text-lg">ENTERPRISE</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-8 h-full">
            <Link
              to="/jobs"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-200 ${
                isLinkActive('/jobs')
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              Find Jobs
            </Link>
            <Link
              to="/post-job"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-200 ${
                isLinkActive('/post-job')
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              Post a Job
            </Link>
            <Link
              to="/resources"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-200 ${
                isLinkActive('/resources') || location.pathname === '/' // Active by default on template page
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              Resources
            </Link>
          </nav>

          {/* Action Icons & Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="relative p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
              <span className="sr-only">Notifications</span>
              <Bell className="h-[21px] w-[21px] stroke-[1.75]" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
            </button>
            <button className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
              <span className="sr-only">Help</span>
              <HelpCircle className="h-[21px] w-[21px] stroke-[1.75]" />
            </button>
            <span className="h-6 w-px bg-slate-200"></span>
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-[4px] text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              Register
            </Link>
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold ${
                isLinkActive('/jobs') ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Find Jobs
            </Link>
            <Link
              to="/post-job"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold ${
                isLinkActive('/post-job') ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Post a Job
            </Link>
            <Link
              to="/resources"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold ${
                isLinkActive('/resources') || location.pathname === '/' ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Resources
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-100">
            <div className="flex items-center px-5 space-x-6">
              <button className="relative p-1.5 rounded-full text-slate-500 hover:text-slate-800">
                <Bell className="h-[21px] w-[21px] stroke-[1.75]" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
              </button>
              <button className="p-1.5 rounded-full text-slate-500 hover:text-slate-800">
                <HelpCircle className="h-[21px] w-[21px] stroke-[1.75]" />
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 text-center"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
