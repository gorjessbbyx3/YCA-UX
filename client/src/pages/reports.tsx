import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, FileText, TrendingUp } from "lucide-react";

export default function Reports() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Reports</h1>
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
              <h1 className="text-2xl font-bold text-navy mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Generate reports and analyze academy performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    Performance Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No performance reports available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Administrative Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No administrative reports available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No trend data available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}