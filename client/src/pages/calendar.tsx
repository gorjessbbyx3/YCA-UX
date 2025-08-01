import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
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
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  campus: z.string().min(1, "Campus is required"),
  maxParticipants: z.number().min(1, "Maximum participants must be at least 1").optional(),
  isRecurring: z.boolean().optional(),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function Calendar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "",
      startTime: "",
      endTime: "",
      location: "",
      campus: "",
      maxParticipants: undefined,
      isRecurring: false,
      notes: "",
    },
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate({
      ...data,
      maxParticipants: data.maxParticipants || undefined,
    });
  };

  // Calendar navigation
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  // Get calendar days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return (events as any[]).filter((event: any) => 
      isSameDay(new Date(event.startTime), day)
    );
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "training": return "bg-blue-500";
      case "ceremony": return "bg-purple-500";
      case "physical_training": return "bg-green-500";
      case "academic": return "bg-yellow-500";
      case "community_service": return "bg-orange-500";
      case "graduation": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const upcomingEvents = (events as any[])
    .filter((event: any) => new Date(event.startTime) > new Date())
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const todayEvents = (events as any[]).filter((event: any) => 
    isSameDay(new Date(event.startTime), new Date())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Calendar</h1>
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
                <h1 className="text-2xl font-bold text-navy mb-2">Academy Calendar</h1>
                <p className="text-gray-600">Manage events, training sessions, and important dates</p>
              </div>
              
              <div className="flex gap-2">
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                </div>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-island-green hover:bg-island-green/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
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
                                  <Input placeholder="Enter event title" {...field} />
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
                                    <SelectItem value="training">Training Session</SelectItem>
                                    <SelectItem value="ceremony">Ceremony</SelectItem>
                                    <SelectItem value="physical_training">Physical Training</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="community_service">Community Service</SelectItem>
                                    <SelectItem value="graduation">Graduation</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
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
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date & Time</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
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
                                <FormLabel>End Date & Time</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Event location" {...field} />
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
                                    <SelectItem value="both">Both Campuses</SelectItem>
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

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any additional information" {...field} />
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
                            disabled={createEventMutation.isPending}
                          >
                            {createEventMutation.isPending ? "Creating..." : "Create Event"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Calendar */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {format(currentDate, "MMMM yyyy")}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("prev")}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("next")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === "month" && (
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days */}
                        {calendarDays.map((day) => {
                          const dayEvents = getEventsForDay(day);
                          const isCurrentMonth = isSameMonth(day, currentDate);
                          const isToday = isSameDay(day, new Date());
                          
                          return (
                            <div
                              key={day.toISOString()}
                              className={`
                                min-h-24 p-1 border border-gray-100 cursor-pointer hover:bg-gray-50
                                ${!isCurrentMonth ? "text-gray-300 bg-gray-50/50" : ""}
                                ${isToday ? "bg-blue-50 border-blue-200" : ""}
                              `}
                              onClick={() => setSelectedDate(day)}
                            >
                              <div className={`
                                text-sm font-medium mb-1
                                ${isToday ? "text-blue-600" : ""}
                              `}>
                                {format(day, "d")}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event: any) => (
                                  <div
                                    key={event.id}
                                    className={`
                                      text-xs p-1 rounded text-white truncate
                                      ${getEventTypeColor(event.eventType)}
                                    `}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Today's Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {todayEvents.map((event: any) => (
                          <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-2">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(event.startTime), "h:mm a")}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No events today</p>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event: any) => (
                          <div key={event.id} className="border-l-4 border-green-500 pl-3 py-2">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(event.startTime), "MMM dd, h:mm a")}
                            </div>
                            <Badge 
                              className={`${getEventTypeColor(event.eventType)} text-white text-xs mt-1`}
                            >
                              {event.eventType}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No upcoming events</p>
                    )}
                  </CardContent>
                </Card>

                {/* Event Type Legend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Event Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span>Training</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        <span>Ceremony</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span>Physical Training</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                        <span>Academic</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                        <span>Community Service</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span>Graduation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}