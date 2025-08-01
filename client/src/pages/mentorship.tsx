import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageCircle, Plus, Phone, Mail, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const mentorshipSchema = z.object({
  cadetId: z.number().min(1, "Please select a cadet"),
  mentorName: z.string().min(1, "Mentor name is required"),
  mentorEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  mentorPhone: z.string().optional(),
  assignedDate: z.string().min(1, "Assignment date is required"),
  meetingFrequency: z.string().optional(),
  notes: z.string().optional(),
});

type MentorshipFormData = z.infer<typeof mentorshipSchema>;

export default function Mentorship() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MentorshipFormData>({
    resolver: zodResolver(mentorshipSchema),
    defaultValues: {
      cadetId: 0,
      mentorName: "",
      mentorEmail: "",
      mentorPhone: "",
      assignedDate: "",
      meetingFrequency: "",
      notes: "",
    },
  });

  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery({
    queryKey: ["/api/mentorships"],
    enabled: !!user,
  });

  const { data: cadets = [] } = useQuery({
    queryKey: ["/api/cadets"],
    enabled: !!user,
  });

  const createMentorshipMutation = useMutation({
    mutationFn: async (data: MentorshipFormData) => {
      const response = await apiRequest("POST", "/api/mentorships", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Mentorship assignment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create mentorship assignment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MentorshipFormData) => {
    createMentorshipMutation.mutate(data);
  };

  const activeMentorships = mentorships.filter((m: any) => m.status === "active");
  const pendingMatches = cadets.filter((cadet: any) => 
    !mentorships.some((m: any) => m.cadetId === cadet.id && m.status === "active")
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-island-green";
      case "completed": return "bg-navy";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "weekly": return "bg-green-500";
      case "biweekly": return "bg-blue-500";
      case "monthly": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Mentorship</h1>
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
                <h1 className="text-2xl font-bold text-navy mb-2">Mentorship Program</h1>
                <p className="text-gray-600">Coordinate mentor-cadet relationships and track progress</p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-island-green hover:bg-island-green/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Mentorship Assignment</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cadetId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Cadet</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a cadet" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cadets.map((cadet: any) => (
                                    <SelectItem key={cadet.id} value={cadet.id.toString()}>
                                      {cadet.firstName} {cadet.lastName} - Class {cadet.classNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mentorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Full name of mentor" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mentorEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor Email (Optional)</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="mentor@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mentorPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="(XXX) XXX-XXXX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assignedDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="meetingFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="as_needed">As Needed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional information about the mentorship" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-island-green hover:bg-island-green/90"
                          disabled={createMentorshipMutation.isPending}
                        >
                          {createMentorshipMutation.isPending ? "Creating..." : "Create Assignment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Mentorships
                    <Badge variant="secondary" className="ml-auto">
                      {activeMentorships.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mentorshipsLoading ? (
                    <p className="text-gray-600">Loading mentorships...</p>
                  ) : activeMentorships.length > 0 ? (
                    <div className="space-y-3">
                      {activeMentorships.slice(0, 3).map((mentorship: any) => {
                        const cadet = cadets.find((c: any) => c.id === mentorship.cadetId);
                        return (
                          <div key={mentorship.id} className="border-l-4 border-island-green pl-3 py-2">
                            <h4 className="font-medium text-sm">
                              {cadet ? `${cadet.firstName} ${cadet.lastName}` : "Unknown Cadet"}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Mentor: {mentorship.mentorName}
                            </p>
                            {mentorship.meetingFrequency && (
                              <Badge 
                                className={`${getFrequencyColor(mentorship.meetingFrequency)} text-white text-xs mt-1`}
                              >
                                {mentorship.meetingFrequency}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600">No active mentorships</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Unmatched Cadets
                    <Badge variant="secondary" className="ml-auto">
                      {pendingMatches.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingMatches.length > 0 ? (
                    <div className="space-y-3">
                      {pendingMatches.slice(0, 3).map((cadet: any) => (
                        <div key={cadet.id} className="border-l-4 border-yellow-500 pl-3 py-2">
                          <h4 className="font-medium text-sm">
                            {cadet.firstName} {cadet.lastName}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Class {cadet.classNumber} • {cadet.campus}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            Needs Mentor
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">All cadets have mentors</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Recent Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mentorships.filter((m: any) => m.lastMeetingDate).length > 0 ? (
                    <div className="space-y-3">
                      {mentorships
                        .filter((m: any) => m.lastMeetingDate)
                        .slice(0, 3)
                        .map((mentorship: any) => {
                          const cadet = cadets.find((c: any) => c.id === mentorship.cadetId);
                          return (
                            <div key={mentorship.id} className="border-l-4 border-blue-500 pl-3 py-2">
                              <h4 className="font-medium text-sm">
                                {cadet ? `${cadet.firstName} ${cadet.lastName}` : "Unknown"}
                              </h4>
                              <p className="text-xs text-gray-600 flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(mentorship.lastMeetingDate), "MMM dd")}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-gray-600">No recent meetings logged</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Mentorships Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Mentorship Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {mentorshipsLoading ? (
                  <p className="text-gray-600">Loading mentorships...</p>
                ) : mentorships.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Cadet</th>
                          <th className="text-left py-2">Mentor</th>
                          <th className="text-left py-2">Contact</th>
                          <th className="text-left py-2">Frequency</th>
                          <th className="text-left py-2">Assigned Date</th>
                          <th className="text-left py-2">Last Meeting</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mentorships.map((mentorship: any) => {
                          const cadet = cadets.find((c: any) => c.id === mentorship.cadetId);
                          return (
                            <tr key={mentorship.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">
                                <div>
                                  <p className="font-medium">
                                    {cadet ? `${cadet.firstName} ${cadet.lastName}` : "Unknown Cadet"}
                                  </p>
                                  {cadet && (
                                    <p className="text-xs text-gray-600">
                                      Class {cadet.classNumber} • {cadet.campus}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2">
                                <p className="font-medium">{mentorship.mentorName}</p>
                              </td>
                              <td className="py-2">
                                <div className="space-y-1">
                                  {mentorship.mentorEmail && (
                                    <p className="text-xs text-gray-600 flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {mentorship.mentorEmail}
                                    </p>
                                  )}
                                  {mentorship.mentorPhone && (
                                    <p className="text-xs text-gray-600 flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {mentorship.mentorPhone}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2">
                                {mentorship.meetingFrequency ? (
                                  <Badge 
                                    className={`${getFrequencyColor(mentorship.meetingFrequency)} text-white`}
                                  >
                                    {mentorship.meetingFrequency}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">Not set</span>
                                )}
                              </td>
                              <td className="py-2 text-xs">
                                {format(new Date(mentorship.assignedDate), "MMM dd, yyyy")}
                              </td>
                              <td className="py-2 text-xs">
                                {mentorship.lastMeetingDate 
                                  ? format(new Date(mentorship.lastMeetingDate), "MMM dd, yyyy")
                                  : "No meetings logged"
                                }
                              </td>
                              <td className="py-2">
                                <Badge 
                                  className={`${getStatusColor(mentorship.status)} text-white`}
                                >
                                  {mentorship.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No mentorship assignments found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}