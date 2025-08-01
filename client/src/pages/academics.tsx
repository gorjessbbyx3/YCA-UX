import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, TrendingUp, Award, Target, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Academics() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const { data: cadets = [], isLoading } = useQuery({
    queryKey: ["/api/cadets"],
    enabled: !!user,
  });

  // Calculate academic statistics based on Academic Excellence component
  const academicStats = cadets.reduce(
    (acc: any, cadet: any) => {
      const academicExcellence = parseFloat(cadet.academicExcellence || cadet.academicProgress || 0);
      acc.totalCadets += 1;
      acc.totalProgress += academicExcellence;
      
      if (academicExcellence >= 90) acc.excellentPerformers += 1;
      else if (academicExcellence >= 70) acc.goodPerformers += 1;
      else if (academicExcellence >= 50) acc.needsImprovement += 1;
      else acc.atRisk += 1;

      return acc;
    },
    {
      totalCadets: 0,
      totalProgress: 0,
      excellentPerformers: 0,
      goodPerformers: 0,
      needsImprovement: 0,
      atRisk: 0,
    }
  );

  const averageProgress = academicStats.totalCadets > 0 
    ? academicStats.totalProgress / academicStats.totalCadets 
    : 0;

  // Group cadets by performance level
  const excellentCadets = cadets.filter((c: any) => parseFloat(c.academicExcellence || c.academicProgress || 0) >= 90);
  const atRiskCadets = cadets.filter((c: any) => parseFloat(c.academicExcellence || c.academicProgress || 0) < 50);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600";
    if (progress >= 70) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const subjects = [
    { name: "Language Arts - Reading", average: 78, icon: BookOpen },
    { name: "Language Arts - Writing", average: 76, icon: BookOpen },
    { name: "Mathematics", average: 72, icon: Target },
    { name: "Science", average: 75, icon: TrendingUp },
    { name: "Social Studies", average: 81, icon: Award },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Academic Progress</h1>
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
              <h1 className="text-2xl font-bold text-navy mb-2">Academic Progress</h1>
              <p className="text-gray-600">Monitor cadet academic performance and HiSET preparation</p>
            </div>

            {/* Academic Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Total Cadets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">
                    {academicStats.totalCadets}
                  </div>
                  <p className="text-xs text-gray-600">Active academic enrollment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                    Average Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {averageProgress.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600">Overall academic progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Award className="mr-2 h-4 w-4 text-green-500" />
                    High Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {academicStats.excellentPerformers}
                  </div>
                  <p className="text-xs text-gray-600">90%+ academic progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-red-500" />
                    At Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {academicStats.atRisk}
                  </div>
                  <p className="text-xs text-gray-600">Below 50% progress</p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject) => {
                      const Icon = subject.icon;
                      return (
                        <div key={subject.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="text-sm font-medium">{subject.name}</span>
                            </div>
                            <span className="text-sm font-medium">{subject.average}%</span>
                          </div>
                          <Progress value={subject.average} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm">Excellent (90%+)</span>
                      </div>
                      <span className="text-sm font-medium">{academicStats.excellentPerformers} cadets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-sm">Good (70-89%)</span>
                      </div>
                      <span className="text-sm font-medium">{academicStats.goodPerformers} cadets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-sm">Needs Improvement (50-69%)</span>
                      </div>
                      <span className="text-sm font-medium">{academicStats.needsImprovement} cadets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm">At Risk (Below 50%)</span>
                      </div>
                      <span className="text-sm font-medium">{academicStats.atRisk} cadets</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            {excellentCadets.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Award className="mr-2 h-5 w-5" />
                    Top Academic Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {excellentCadets.slice(0, 6).map((cadet: any) => {
                      const academicScore = parseFloat(cadet.academicExcellence || cadet.academicProgress || 0);
                      return (
                        <div key={cadet.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">
                              {cadet.firstName} {cadet.lastName}
                            </h4>
                            <Badge className="bg-green-500 text-white text-xs">
                              {academicScore.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Class {cadet.classNumber} • {cadet.campus}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Academic Excellence</span>
                              <span className="font-medium">{academicScore.toFixed(1)}%</span>
                            </div>
                            <Progress value={academicScore} className="h-1" />
                            {cadet.tabeReadingScore && (
                              <div className="flex justify-between text-xs">
                                <span>TABE Reading</span>
                                <span className="font-medium">{cadet.tabeReadingScore}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* At-Risk Students */}
            {atRiskCadets.length > 0 && (
              <Card className="mb-6 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Clock className="mr-2 h-5 w-5" />
                    Cadets Needing Academic Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {atRiskCadets.map((cadet: any) => {
                      const academicScore = parseFloat(cadet.academicExcellence || cadet.academicProgress || 0);
                      return (
                        <div key={cadet.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">
                              {cadet.firstName} {cadet.lastName}
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              At Risk
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Class {cadet.classNumber} • {cadet.campus}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Academic Excellence</span>
                              <span className="font-medium text-red-600">
                                {academicScore.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={academicScore} className="h-1" />
                            {cadet.tabeReadingScore && (
                              <div className="flex justify-between text-xs">
                                <span>TABE Reading</span>
                                <span className="font-medium text-red-600">{cadet.tabeReadingScore}</span>
                              </div>
                            )}
                          </div>
                          {cadet.notes && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Notes: {cadet.notes.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Cadets Academic Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Cadets Academic Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600">Loading academic data...</p>
                ) : cadets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Cadet</th>
                          <th className="text-left py-2">Class</th>
                          <th className="text-left py-2">Campus</th>
                          <th className="text-left py-2">Academic Excellence</th>
                          <th className="text-left py-2">Physical Fitness</th>
                          <th className="text-left py-2">Leadership</th>
                          <th className="text-left py-2">Community Service</th>
                          <th className="text-left py-2">TABE Scores</th>
                          <th className="text-left py-2">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cadets.map((cadet: any) => {
                          const academicExcellence = parseFloat(cadet.academicExcellence || cadet.academicProgress || 0);
                          const physicalFitness = parseFloat(cadet.physicalFitness || cadet.fitnessProgress || 0);
                          const leadership = parseFloat(cadet.leadershipFollowership || cadet.leadershipProgress || 0);
                          const communityService = parseFloat(cadet.communityService || 0);
                          const serviceHours = parseInt(cadet.serviceHours || 0);

                          return (
                            <tr key={cadet.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">
                                <div>
                                  <p className="font-medium">{cadet.firstName} {cadet.lastName}</p>
                                  <p className="text-xs text-gray-600">{cadet.email}</p>
                                </div>
                              </td>
                              <td className="py-2">
                                <Badge variant="outline">
                                  Class {cadet.classNumber}
                                </Badge>
                              </td>
                              <td className="py-2">
                                <Badge variant="outline" className="capitalize">
                                  {cadet.campus}
                                </Badge>
                              </td>
                              <td className="py-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center w-24">
                                    <span className={`text-sm font-medium ${getProgressColor(academicExcellence)}`}>
                                      {academicExcellence.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress value={academicExcellence} className="h-1 w-24" />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center w-24">
                                    <span className={`text-sm font-medium ${getProgressColor(physicalFitness)}`}>
                                      {physicalFitness.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress value={physicalFitness} className="h-1 w-24" />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center w-24">
                                    <span className={`text-sm font-medium ${getProgressColor(leadership)}`}>
                                      {leadership.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress value={leadership} className="h-1 w-24" />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="text-center">
                                  <span className="font-medium">{Math.max(serviceHours, communityService)}</span>
                                  <span className="text-xs text-gray-600 ml-1">hrs</span>
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="text-xs space-y-1">
                                  {cadet.tabeReadingScore && (
                                    <div>R: {cadet.tabeReadingScore}</div>
                                  )}
                                  {cadet.tabeMathScore && (
                                    <div>M: {cadet.tabeMathScore}</div>
                                  )}
                                  {cadet.tabeLanguageScore && (
                                    <div>L: {cadet.tabeLanguageScore}</div>
                                  )}
                                  {!cadet.tabeReadingScore && !cadet.tabeMathScore && !cadet.tabeLanguageScore && (
                                    <span className="text-gray-400">Not tested</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2">
                                <Badge 
                                  className={`${getProgressBadgeColor(academicExcellence)} text-white`}
                                >
                                  {academicExcellence >= 90 ? "Excellent" :
                                   academicExcellence >= 70 ? "Good" :
                                   academicExcellence >= 50 ? "Fair" : "At Risk"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No academic data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}