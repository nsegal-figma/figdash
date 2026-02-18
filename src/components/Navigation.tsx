import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Upload, LayoutDashboard } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function Navigation() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const links = [
    { path: '/', label: 'Upload', icon: Upload },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">FigDash</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId={prefersReducedMotion ? undefined : 'nav-indicator'}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

