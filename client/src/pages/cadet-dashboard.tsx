import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  GraduationCap, 
  Heart, 
  Briefcase, 
  Users, 
  Brain, 
  Dumbbell, 
  Shield, 
  HandHeart,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Activity
} from "lucide-react";

const coreComponents = [
  { 
    id: 'academicExcellence', 
    name: 'Academic Excellence', 
    icon: GraduationCap, 
    color: 'blue',
    description: 'GED preparation, TABE scores, academic classes'
  },
  { 
    id: 'healthHygiene', 
    name: 'Health & Hygiene', 
    icon: Heart, 
    color: 'green',
    description: 'Health education, nutrition, substance abuse awareness'
  },
  { 
    id: 'jobSkills', 
    name: 'Job Skills', 
    icon: Briefcase, 
    color: 'amber',
    description: 'Career assessment, resume building, interview skills'
  },
  { 
    id: 'leadership', 
    name: 'Leadership', 
    icon: Users, 
    color: 'purple',
    description: 'Military customs, character development, leadership roles'
  },
  { 
    id: 'lifeCopingSkills', 
    name: 'Life Coping Skills', 
    icon: Brain, 
    color: 'indigo',
    description: 'Self-regulation, conflict resolution, financial literacy'
  },
  { 
    id: 'physicalFitness', 
    name: 'Physical Fitness', 
    icon: Dumbbell, 
    color: 'emerald',
    description: 'President\'s Challenge fitness standards, PT training'
  },
  { 
    id: 'responsibleCitizenship', 
    name: 'Responsible Citizenship', 
    icon: Shield, 
    color: 'slate',
    description: 'Civics education, voting registration, government understanding'
  },
  { 
    id: 'communityService', 
    name: 'Community Service', 
    icon: HandHeart, 
    color: 'orange',
    description: 'Service projects, minimum 40 hours requirement'
  }
];

export default function CadetDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { id } = useParams() as { id: string };
  const { toast } = useToast();

  const { data: cadet, isLoading: cadetLoading } = useQuery({
    queryKey: ['/api/cadets', id],
  }) as { data: any, isLoading: boolean };

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
  });

  if (cadetLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!cadet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Cadet not found</h2>
            <p className="text-gray-600">The cadet you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const overallProgress = coreComponents.reduce((sum, component) => {
    return sum + (Number(cadet[component.id as keyof typeof cadet]) || 0);
  }, 0) / coreComponents.length;

  // Get cadet's upcoming events
  const cadetEvents = (events as any[])?.filter((event: any) => 
    event.title?.toLowerCase().includes(cadet.firstName?.toLowerCase()) ||
    event.description?.toLowerCase().includes(cadet.firstName?.toLowerCase())
  ).slice(0, 5) || [];

  // Calculate weeks in program
  const startDate = cadet.startDate ? new Date(cadet.startDate) : new Date();
  const currentDate = new Date();
  const weeksInProgram = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const progressInProgram = Math.min((weeksInProgram / 22) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="lg:pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg font-bold bg-blue-600 text-white">
                      {cadet.firstName?.[0]}{cadet.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {cadet.firstName} {cadet.lastName}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Class {cadet.classNumber}</span>
                      <span>•</span>
                      <span>{cadet.campus?.toUpperCase()} Campus</span>
                      <span>•</span>
                      <Badge variant={cadet.status === 'active' ? 'default' : 'secondary'}>
                        {cadet.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Week {weeksInProgram} of 22</div>
                  <div className="text-lg font-bold text-blue-600">{progressInProgram.toFixed(0)}% Complete</div>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{overallProgress.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <HandHeart className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Service Hours</p>
                      <p className="text-2xl font-bold text-gray-900">{cadet.serviceHours || 0}</p>
                      <p className="text-xs text-gray-500">of 40 required</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">TABE Math</p>
                      <p className="text-2xl font-bold text-gray-900">{cadet.tabeScoreMath || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">TABE Reading</p>
                      <p className="text-2xl font-bold text-gray-900">{cadet.tabeScoreReading || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="progress" className="space-y-6">
              <TabsList>
                <TabsTrigger value="progress">Core Components</TabsTrigger>
                <TabsTrigger value="timeline">Timeline & Goals</TabsTrigger>
                <TabsTrigger value="activities">Activities & Events</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-6">
                {/* Core Components Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coreComponents.map((component) => {
                    const progress = Number(cadet[component.id as keyof typeof cadet]) || 0;
                    const Icon = component.icon;
                    
                    return (
                      <Card key={component.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-sm">
                            <div className={`p-2 rounded-lg mr-3 ${
                              component.color === 'blue' ? 'bg-blue-100' :
                              component.color === 'green' ? 'bg-green-100' :
                              component.color === 'amber' ? 'bg-amber-100' :
                              component.color === 'purple' ? 'bg-purple-100' :
                              component.color === 'indigo' ? 'bg-indigo-100' :
                              component.color === 'emerald' ? 'bg-emerald-100' :
                              component.color === 'slate' ? 'bg-slate-100' :
                              'bg-orange-100'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                component.color === 'blue' ? 'text-blue-600' :
                                component.color === 'green' ? 'text-green-600' :
                                component.color === 'amber' ? 'text-amber-600' :
                                component.color === 'purple' ? 'text-purple-600' :
                                component.color === 'indigo' ? 'text-indigo-600' :
                                component.color === 'emerald' ? 'text-emerald-600' :
                                component.color === 'slate' ? 'text-slate-600' :
                                'text-orange-600'
                              }`} />
                            </div>
                            {component.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500">{component.description}</p>
                            
                            {/* Status indicator */}
                            <div className="flex items-center space-x-2">
                              {progress >= 80 ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-600">Excellent Progress</span>
                                </>
                              ) : progress >= 60 ? (
                                <>
                                  <Activity className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-blue-600">On Track</span>
                                </>
                              ) : progress >= 40 ? (
                                <>
                                  <Clock className="h-4 w-4 text-amber-500" />
                                  <span className="text-xs text-amber-600">Needs Attention</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-xs text-red-600">Requires Focus</span>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Program Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Program Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Start Date</span>
                          <span className="text-sm font-medium">
                            {cadet.startDate ? format(new Date(cadet.startDate), "MMM dd, yyyy") : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Expected Graduation</span>
                          <span className="text-sm font-medium">
                            {cadet.graduationDate ? format(new Date(cadet.graduationDate), "MMM dd, yyyy") : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Weeks Completed</span>
                          <span className="text-sm font-medium">{weeksInProgram} of 22</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Program Progress</span>
                          <span className="text-sm font-medium">{progressInProgram.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressInProgram} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goals & Milestones */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        Goals & Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Enrollment Complete</span>
                          </div>
                          <Badge variant="default">Complete</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            {(cadet.serviceHours || 0) >= 40 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 mr-2" />
                            )}
                            <span className="text-sm">40 Service Hours</span>
                          </div>
                          <Badge variant={(cadet.serviceHours || 0) >= 40 ? "default" : "secondary"}>
                            {(cadet.serviceHours || 0) >= 40 ? "Complete" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            {overallProgress >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 mr-2" />
                            )}
                            <span className="text-sm">Core Components 80%+</span>
                          </div>
                          <Badge variant={overallProgress >= 80 ? "default" : "secondary"}>
                            {overallProgress >= 80 ? "Complete" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-amber-500 mr-2" />
                            <span className="text-sm">Program Graduation</span>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Upcoming Activities & Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cadetEvents.length > 0 ? (
                      <div className="space-y-3">
                        {cadetEvents.map((event: any) => (
                          <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs text-gray-600">
                                {format(new Date(event.startTime), "MMM dd, yyyy • h:mm a")}
                              </div>
                              {event.location && (
                                <div className="text-xs text-gray-500">{event.location}</div>
                              )}
                            </div>
                            <Badge variant="outline">{event.eventType?.replace(/_/g, ' ')}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No upcoming events found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      Development Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cadet.notes ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{cadet.notes}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No development notes available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}