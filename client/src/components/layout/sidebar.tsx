import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Cadet Management', href: '/cadets', icon: 'fas fa-users' },
  { name: 'Scheduling', href: '/scheduling', icon: 'fas fa-calendar-alt' },
  { name: 'Academic Progress', href: '/academics', icon: 'fas fa-graduation-cap' },
  { name: 'Mentorship', href: '/mentorship', icon: 'fas fa-handshake' },
  { name: 'Inventory', href: '/inventory', icon: 'fas fa-boxes' },
  { name: 'Applications', href: '/applications', icon: 'fas fa-file-alt' },
  { name: 'Reports', href: '/reports', icon: 'fas fa-chart-bar' },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-navy overflow-y-auto">
        {/* Logo/Header */}
        <div className="flex items-center flex-shrink-0 px-4 py-6 bg-navy">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-shield-alt text-navy text-lg"></i>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">HI Youth Challenge</h1>
              <p className="text-gray-300 text-xs">Academy Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-light-navy text-white"
                      : "text-gray-300 hover:bg-light-navy hover:text-white"
                  )}
                >
                  <i className={cn(item.icon, isActive ? "text-gold" : "", "mr-3")}></i>
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-t border-light-navy">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Staff Officer</p>
              <p className="text-gray-300 text-xs">Administrative</p>
            </div>
            <button 
              className="text-gray-300 hover:text-white"
              onClick={() => window.location.href = '/api/logout'}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
