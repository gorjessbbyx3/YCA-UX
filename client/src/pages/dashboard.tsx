import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import CadetProgress from "@/components/dashboard/cadet-progress";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedCampus, setSelectedCampus] = useState("oahu");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-navy px-4 py-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-shield-alt text-navy text-sm"></i>
            </div>
            <h1 className="text-white font-semibold text-sm">HI Youth Challenge</h1>
          </div>
          <button 
            className="text-white hover:text-gold" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Staff Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Hawaii National Guard Youth Challenge Academy</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                
                {/* Campus selector */}
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oahu">Oahu Campus (Kalaeloa)</SelectItem>
                    <SelectItem value="hilo">Hilo Job Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Key Metrics Cards */}
            <MetricsGrid campus={selectedCampus} />

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
              <div className="lg:col-span-2">
                <RecentActivity campus={selectedCampus} />
              </div>
            </div>

            {/* Cadet Progress & Campus Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CadetProgress />
              
              {/* Campus Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedCampus === 'oahu' ? 'Oahu Campus Information' : 'Hilo Job Challenge Information'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-map-marker-alt text-navy mt-1"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">
                        {selectedCampus === 'oahu' 
                          ? '91-1096 Shangrila St, Kapolei, HI 96707'
                          : '1046 Leilani St, Hilo, HI 96720'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-phone text-navy mt-1"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Contact</p>
                      <p className="text-sm text-gray-600">
                        {selectedCampus === 'oahu' ? '808-685-7135' : '808-430-4184'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedCampus === 'oahu' 
                          ? 'admissions.yca.oahu@hawaii.gov'
                          : 'admissions.yca.hilo@hawaii.gov'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-info-circle text-navy mt-1"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Program Focus</p>
                      <p className="text-sm text-gray-600">
                        {selectedCampus === 'oahu' 
                          ? 'Basic Youth Challenge Program (16-18 years)'
                          : 'Career Training for YCA Graduates (17-20 years)'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <UpcomingEvents campus={selectedCampus} />
          </div>
        </main>
      </div>
    </div>
  );
}
