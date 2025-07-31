import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-light-navy to-island-green flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Main Login Card */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-navy text-2xl"></i>
              </div>
              <CardTitle className="text-2xl font-bold text-navy mb-2">
                Staff Login Portal
              </CardTitle>
              <CardDescription className="text-base">
                Hawaii National Guard Youth Challenge Academy
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Access the staff management system for both Oahu and Hilo campuses.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-navy hover:bg-light-navy text-white font-semibold py-3"
                  onClick={() => window.location.href = '/api/login'}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Login with Replit
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <i className="fas fa-users text-island-green mb-1"></i>
                    <p className="font-medium">Cadet Management</p>
                  </div>
                  <div className="text-center">
                    <i className="fas fa-graduation-cap text-gold mb-1"></i>
                    <p className="font-medium">Academic Tracking</p>
                  </div>
                  <div className="text-center">
                    <i className="fas fa-calendar-alt text-navy mb-1"></i>
                    <p className="font-medium">Event Scheduling</p>
                  </div>
                  <div className="text-center">
                    <i className="fas fa-chart-bar text-island-green mb-1"></i>
                    <p className="font-medium">Progress Reports</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Campus Info */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm mb-2">Serving Hawaii's At-Promise Youth</p>
            <div className="flex justify-center space-x-6 text-gold text-sm">
              <span><i className="fas fa-map-marker-alt mr-1"></i>Oahu Campus</span>
              <span><i className="fas fa-map-marker-alt mr-1"></i>Hilo Campus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
