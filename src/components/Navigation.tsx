import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, Lightbulb } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Upload', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Survey Analytics</span>
            </div>
          </div>
          <div className="flex space-x-4">
            {links.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

