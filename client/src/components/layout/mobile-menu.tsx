import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-64 bg-navy">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-shield-alt text-navy text-lg"></i>
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">HI Youth Challenge</h1>
                <p className="text-gray-300 text-xs">Academy Portal</p>
              </div>
            </div>
            <button className="text-white hover:text-gold" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Mobile navigation items */}
          <nav className="flex-1 px-4 space-y-2">
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
                    onClick={onClose}
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
    </div>
  );
}
