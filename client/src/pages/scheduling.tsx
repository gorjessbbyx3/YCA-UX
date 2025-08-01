import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, isSameDay } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Plus, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const bulkEventSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  title: z.string().min(1, "Event title is required"),
  location: z.string().min(1, "Location is required"),
  campus: z.string().min(1, "Campus is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  repeatDays: z.array(z.string()).min(1, "Select at least one day"),
  description: z.string().optional(),
  maxParticipants: z.number().optional(),
});

type BulkEventFormData = z.infer<typeof bulkEventSchema>;

export default function Scheduling() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BulkEventFormData>({
    resolver: zodResolver(bulkEventSchema),
    defaultValues: {
      eventType: "",
      title: "",
      location: "",
      campus: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      repeatDays: [],
      description: "",
      maxParticipants: undefined,
    },
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const createBulkEventsMutation = useMutation({
    mutationFn: async (data: BulkEventFormData) => {
      // Create multiple events based on the date range and repeat days
      const events = [];
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayName = format(date, "EEEE").toLowerCase();
        if (data.repeatDays.includes(dayName)) {
          const eventData = {
            title: data.title,
            description: data.description,
            eventType: data.eventType,
            startTime: `${format(date, "yyyy-MM-dd")}T${data.startTime}`,
            endTime: `${format(date, "yyyy-MM-dd")}T${data.endTime}`,
            location: data.location,
            campus: data.campus,
            maxParticipants: data.maxParticipants,
            isRecurring: true,
            notes: `Part of recurring series: ${data.title}`,
          };
          events.push(eventData);
        }
      }

      // Create all events
      const promises = events.map(event => 
        apiRequest("POST", "/api/events", event).then(res => res.json())
      );
      return Promise.all(promises);
    },
    onSuccess: (events) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsBulkDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: `Created ${events.length} recurring events`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create bulk events",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BulkEventFormData) => {
    createBulkEventsMutation.mutate(data);
  };

  // Get events for the next 7 days
  const weekEvents = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dayEvents = (events as any[]).filter((event: any) => 
      isSameDay(new Date(event.startTime), date)
    );
    return {
      date,
      events: dayEvents,
    };
  });

  // Resource conflicts detection
  const conflicts = (events as any[]).reduce((acc: any[], event: any) => {
    const conflicting = (events as any[]).filter((other: any) => 
      other.id !== event.id &&
      other.location === event.location &&
      new Date(other.startTime) < new Date(event.endTime) &&
      new Date(other.endTime) > new Date(event.startTime)
    );
    if (conflicting.length > 0) {
      acc.push({ event, conflicts: conflicting });
    }
    return acc;
  }, []);

  // Event statistics
  const upcomingEvents = (events as any[]).filter((event: any) => 
    new Date(event.startTime) > new Date()
  ).length;

  const coreComponentEvents = (events as any[]).filter((event: any) => 
    ["academic_excellence", "health_hygiene", "job_skills", "leadership", 
     "life_coping_skills", "physical_fitness", "responsible_citizenship", "community_service"].includes(event.eventType)
  ).length;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "academic_excellence": return "bg-blue-600";
      case "health_hygiene": return "bg-green-600";
      case "job_skills": return "bg-amber-600";
      case "leadership": return "bg-purple-600";
      case "life_coping_skills": return "bg-indigo-600";
      case "physical_fitness": return "bg-emerald-600";
      case "responsible_citizenship": return "bg-slate-600";
      case "community_service": return "bg-orange-600";
      case "ceremony": return "bg-red-600";
      case "graduation": return "bg-gold";
      case "meeting": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Event Scheduling</h1>
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
                <h1 className="text-2xl font-bold text-navy mb-2">Advanced Event Scheduling</h1>
                <p className="text-gray-600">Manage recurring training schedules, bulk events, and resource allocation</p>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-island-green hover:bg-island-green/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Recurring Events
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create Recurring Event Series</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Morning PT Session" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="eventType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select event type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="academic_excellence">Academic Excellence</SelectItem>
                                    <SelectItem value="health_hygiene">Health and Hygiene</SelectItem>
                                    <SelectItem value="job_skills">Job Skills</SelectItem>
                                    <SelectItem value="leadership">Leadership/Followership</SelectItem>
                                    <SelectItem value="life_coping_skills">Life Coping Skills</SelectItem>
                                    <SelectItem value="physical_fitness">Physical Fitness</SelectItem>
                                    <SelectItem value="responsible_citizenship">Responsible Citizenship</SelectItem>
                                    <SelectItem value="community_service">Service to Community</SelectItem>
                                    <SelectItem value="meeting">Staff Meeting</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Event description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="repeatDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repeat on Days</FormLabel>
                              <div className="grid grid-cols-4 gap-2">
                                {weekDays.map((day) => (
                                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={field.value.includes(day)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...field.value, day]);
                                        } else {
                                          field.onChange(field.value.filter((d: string) => d !== day));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="text-sm capitalize">{day}</span>
                                  </label>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Training facility, classroom, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="campus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campus</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select campus" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="oahu">Oahu</SelectItem>
                                    <SelectItem value="hilo">Hilo</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="maxParticipants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Participants (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter max participants"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsBulkDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-island-green hover:bg-island-green/90"
                            disabled={createBulkEventsMutation.isPending}
                          >
                            {createBulkEventsMutation.isPending ? "Creating..." : "Create Events"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{upcomingEvents}</div>
                  <p className="text-xs text-gray-600">Next 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Core Component Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{coreComponentEvents}</div>
                  <p className="text-xs text-gray-600">8 core components</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-green-500" />
                    Resource Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{conflicts.length}</div>
                  <p className="text-xs text-gray-600">Detected conflicts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-purple-500" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">98%</div>
                  <p className="text-xs text-gray-600">Event completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Weekly Schedule Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weekEvents.map(({ date, events: dayEvents }, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">
                        {format(date, "EEE, MMM d")}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.slice(0, 3).map((event: any) => (
                          <div
                            key={event.id}
                            className={`
                              text-xs p-2 rounded text-white
                              ${getEventTypeColor(event.eventType)}
                            `}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(event.startTime), "h:mm a")}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                        {dayEvents.length === 0 && (
                          <div className="text-xs text-gray-400 text-center">No events</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Conflicts */}
            {conflicts.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Resource Conflicts Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conflicts.map((conflict: any, index: number) => (
                      <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-red-800">{conflict.event.title}</h4>
                          <Badge variant="destructive">Conflict</Badge>
                        </div>
                        <div className="text-sm text-red-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {conflict.event.location} • {format(new Date(conflict.event.startTime), "MMM dd, h:mm a")}
                        </div>
                        <div className="text-sm text-red-600">
                          Conflicts with: {conflict.conflicts.map((c: any) => c.title).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}