import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, LayoutDashboard, Lightbulb } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Upload', icon: Upload },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
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
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

