import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-light-navy to-island-green">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shield-alt text-navy text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Hawaii National Guard
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
            Youth Challenge Academy
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Staff Portal - Empowering at-promise youth through character development, 
            education, and responsible citizenship in the spirit of Aloha.
          </p>
          <Button 
            size="lg" 
            className="bg-gold hover:bg-gold/90 text-navy font-semibold px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Staff Login
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-users text-white"></i>
              </div>
              <CardTitle className="text-navy">Cadet Management</CardTitle>
              <CardDescription>
                Comprehensive tracking and management of cadet progress, attendance, and development.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-island-green rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <CardTitle className="text-navy">Academic Excellence</CardTitle>
              <CardDescription>
                Monitor academic progress and HiSET preparation for all cadets across both campuses.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-hands-helping text-navy"></i>
              </div>
              <CardTitle className="text-navy">Community Service</CardTitle>
              <CardDescription>
                Track community service hours and coordinate with partner organizations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-calendar-alt text-white"></i>
              </div>
              <CardTitle className="text-navy">Scheduling</CardTitle>
              <CardDescription>
                Efficient scheduling system for events, training, and staff coordination.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-island-green rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-handshake text-white"></i>
              </div>
              <CardTitle className="text-navy">Mentorship</CardTitle>
              <CardDescription>
                Coordinate mentorship programs and track cadet-mentor relationships.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-navy"></i>
              </div>
              <CardTitle className="text-navy">Applications</CardTitle>
              <CardDescription>
                Review and process applications from prospective cadets statewide.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">Our Campuses</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h4 className="text-xl font-semibold text-gold mb-2">Oahu Campus (Kalaeloa)</h4>
                <p className="text-gray-200 mb-2">91-1096 Shangrila St, Kapolei, HI 96707</p>
                <p className="text-gray-200 mb-2">Basic Youth Challenge Program (16-18 years)</p>
                <p className="text-gray-200">Contact: 808-685-7135</p>
              </div>
              <div className="text-left">
                <h4 className="text-xl font-semibold text-gold mb-2">Hilo Job Challenge Academy</h4>
                <p className="text-gray-200 mb-2">1046 Leilani St, Hilo, HI 96720</p>
                <p className="text-gray-200 mb-2">Career Training for YCA Graduates (17-20 years)</p>
                <p className="text-gray-200">Contact: 808-430-4184</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
