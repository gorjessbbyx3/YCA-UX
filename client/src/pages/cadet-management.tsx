import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import CadetList from "@/components/cadet/cadet-list";
import AddCadetForm from "@/components/cadet/add-cadet-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Bell } from "lucide-react";

export default function CadetManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCampus, setSelectedCampus] = useState("oahu");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddCadetOpen, setIsAddCadetOpen] = useState(false);

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
                <h1 className="text-2xl font-semibold text-gray-900">Cadet Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage active cadets and track their progress</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Add Cadet Button */}
                <Dialog open={isAddCadetOpen} onOpenChange={setIsAddCadetOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-navy hover:bg-light-navy">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Cadet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Cadet</DialogTitle>
                    </DialogHeader>
                    <AddCadetForm onSuccess={() => setIsAddCadetOpen(false)} />
                  </DialogContent>
                </Dialog>

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

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <CadetList campus={selectedCampus} />
          </div>
        </main>
      </div>
    </div>
  );
}
