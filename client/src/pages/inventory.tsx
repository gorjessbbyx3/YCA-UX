import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Truck } from "lucide-react";

export default function Inventory() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Inventory</h1>
          <button 
            className="text-white hover:text-gold" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2">Equipment Inventory</h1>
              <p className="text-gray-600">Track equipment, supplies, and resource allocation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Equipment Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No equipment tracked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No low stock alerts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No pending orders</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}