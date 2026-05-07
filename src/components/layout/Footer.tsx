import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const links = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Accessibility', path: '/accessibility' },
    { label: 'Security', path: '/security' }
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Copyright text */}
          <div className="text-xs text-slate-400 font-sans">
            © 2024 HireArch Enterprise. All rights reserved.
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {links.map((link, idx) => (
              <React.Fragment key={link.path}>
                <Link
                  to={link.path}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-sans"
                >
                  {link.label}
                </Link>
                {idx < links.length - 1 && (
                  <span className="hidden sm:inline text-slate-200 text-xs">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};
