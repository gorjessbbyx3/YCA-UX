import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subMonths } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Download, TrendingUp, Users, Calendar, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useAuth } from "@/hooks/useAuth";

export default function Reports() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const { data: cadets = [] } = useQuery({
    queryKey: ["/api/cadets"],
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });

  // Calculate key metrics
  const totalCadets = cadets.length;
  const activeCadets = cadets.filter((c: any) => c.status === "active").length;
  const graduatedCadets = cadets.filter((c: any) => c.status === "graduated").length;
  const pendingApplications = applications.filter((a: any) => a.status === "pending").length;

  // Academic progress distribution
  const academicProgressDistribution = [
    { name: "Excellent (90%+)", value: cadets.filter((c: any) => parseFloat(c.academicProgress || 0) >= 90).length, color: "#10B981" },
    { name: "Good (70-89%)", value: cadets.filter((c: any) => parseFloat(c.academicProgress || 0) >= 70 && parseFloat(c.academicProgress || 0) < 90).length, color: "#3B82F6" },
    { name: "Fair (50-69%)", value: cadets.filter((c: any) => parseFloat(c.academicProgress || 0) >= 50 && parseFloat(c.academicProgress || 0) < 70).length, color: "#F59E0B" },
    { name: "At Risk (<50%)", value: cadets.filter((c: any) => parseFloat(c.academicProgress || 0) < 50).length, color: "#EF4444" },
  ];

  // Campus distribution
  const campusDistribution = [
    { name: "Oahu", cadets: cadets.filter((c: any) => c.campus === "oahu").length },
    { name: "Hilo", cadets: cadets.filter((c: any) => c.campus === "hilo").length },
  ];

  // Monthly application trends (last 6 months)
  const applicationTrends = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthApplications = applications.filter((a: any) => {
      const appDate = new Date(a.submittedAt);
      return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
    }).length;
    
    return {
      month: format(date, "MMM"),
      applications: monthApplications,
    };
  });

  // Service hours by class
  const serviceHoursByClass = cadets.reduce((acc: any, cadet: any) => {
    const classNum = cadet.classNumber || "Unassigned";
    acc[classNum] = (acc[classNum] || 0) + parseInt(cadet.serviceHours || 0);
    return acc;
  }, {});

  const serviceHoursData = Object.entries(serviceHoursByClass).map(([classNum, hours]) => ({
    class: `Class ${classNum}`,
    hours: hours as number,
  }));

  // Recent activity summary
  const recentActivities = activities.slice(0, 10);

  const downloadReport = (type: string) => {
    // In a real implementation, this would generate and download actual reports
    const data = {
      cadets,
      applications,
      events,
      generatedAt: new Date().toISOString(),
      type,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HYCA_${type}_Report_${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-navy mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">Generate comprehensive reports and analyze program data</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => downloadReport("comprehensive")}
                  className="text-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Full Report
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    Total Cadets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{totalCadets}</div>
                  <p className="text-xs text-gray-600">
                    {activeCadets} active, {graduatedCadets} graduated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{applications.length}</div>
                  <p className="text-xs text-gray-600">
                    {pendingApplications} pending review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-green-500" />
                    Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{events.length}</div>
                  <p className="text-xs text-gray-600">
                    {events.filter((e: any) => new Date(e.startTime) > new Date()).length} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Activity className="mr-2 h-4 w-4 text-purple-500" />
                    Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">{activities.length}</div>
                  <p className="text-xs text-gray-600">System activities logged</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Academic Progress Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Academic Progress Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={academicProgressDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {academicProgressDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {academicProgressDistribution.map((item, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div 
                          className="w-3 h-3 rounded mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Campus Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Campus Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={campusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="cadets" fill="#1e40af" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Application Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Application Trends (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Hours by Class */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Service Hours by Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={serviceHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class" />
                      <YAxis />
                      <Bar dataKey="hours" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Comprehensive performance metrics and analytics</p>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadReport("performance")}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Performance Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Enrollment Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Cadet enrollment and demographic data</p>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadReport("enrollment")}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Enrollment Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">System activity and engagement metrics</p>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadReport("activity")}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Activity Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity: any, index) => (
                      <div key={activity.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {format(new Date(activity.createdAt), "MMM dd, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No recent activities</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}