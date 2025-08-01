import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, eachHourOfInterval, setHours, startOfDay } from "date-fns";
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
  const [currentWeek, setCurrentWeek] = useState(new Date());
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

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(direction === "prev" ? addWeeks(currentWeek, -1) : addWeeks(currentWeek, 1));
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

  // Weekly schedule data
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const timeSlots = Array.from({ length: 24 }, (_, i) => setHours(startOfDay(new Date()), i));

  // Get events for the current week
  const weekEvents = (events as any[]).filter((event: any) => {
    const eventDate = new Date(event.startTime);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  // Get events for a specific time slot
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    return weekEvents.filter((event: any) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const slotStart = setHours(day, hour);
      const slotEnd = setHours(day, hour + 1);
      
      return isSameDay(eventStart, day) && 
             eventStart < slotEnd && 
             eventEnd > slotStart;
    });
  };

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

            {/* Weekly Staff Schedule */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Weekly Staff Schedule - {format(weekStart, "MMM dd")} to {format(weekEnd, "MMM dd, yyyy")}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentWeek(new Date())}
                      >
                        This Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Header with days */}
                      <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="p-2 text-xs font-medium text-gray-500">Time</div>
                        {weekDays.map((day) => (
                          <div key={day.toISOString()} className="p-2 text-center">
                            <div className="font-medium text-sm">
                              {format(day, "EEE")}
                            </div>
                            <div className={`text-xs ${isSameDay(day, new Date()) ? "text-blue-600 font-medium" : "text-gray-600"}`}>
                              {format(day, "MMM dd")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Time slots grid */}
                      <div className="space-y-1">
                        {timeSlots.map((timeSlot, timeIndex) => {
                          const hour = timeIndex;
                          // Only show business hours (6 AM to 10 PM)
                          if (hour < 6 || hour > 22) return null;
                          
                          return (
                            <div key={timeIndex} className="grid grid-cols-8 gap-1">
                              <div className="p-2 text-xs text-gray-500 font-medium border-r">
                                {format(timeSlot, "h:mm a")}
                              </div>
                              {weekDays.map((day) => {
                                const slotEvents = getEventsForTimeSlot(day, hour);
                                return (
                                  <div 
                                    key={`${day.toISOString()}-${hour}`}
                                    className="p-1 border border-gray-100 min-h-12 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <div className="space-y-1">
                                      {slotEvents.map((event: any) => (
                                        <div
                                          key={event.id}
                                          className={`
                                            text-xs p-1 rounded text-white truncate
                                            ${getEventTypeColor(event.eventType)}
                                          `}
                                          title={`${event.title} - ${format(new Date(event.startTime), "h:mm a")} to ${format(new Date(event.endTime), "h:mm a")}`}
                                        >
                                          <div className="font-medium truncate">{event.title}</div>
                                          {event.location && (
                                            <div className="flex items-center">
                                              <MapPin className="w-2 h-2 mr-1" />
                                              <span className="truncate">{event.location}</span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Schedule Summary */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm mb-4">This Week's Highlights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Training Sessions</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {weekEvents.filter((e: any) => e.eventType === "training" || e.eventType === "physical_training").length}
                        </div>
                        <div className="text-xs text-blue-600">Scheduled this week</div>
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Ceremonies</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {weekEvents.filter((e: any) => e.eventType === "ceremony").length}
                        </div>
                        <div className="text-xs text-green-600">Special events</div>
                      </div>

                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Total Hours</span>
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {weekEvents.reduce((total: number, event: any) => {
                            const start = new Date(event.startTime);
                            const end = new Date(event.endTime);
                            return total + Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
                          }, 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-orange-600">Scheduled hours</div>
                      </div>
                    </div>
                  </div>

                  {/* Staff Assignments */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm mb-4">Staff Assignments This Week</h4>
                    <div className="space-y-2">
                      {weekEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {weekEvents
                            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                            .map((event: any) => (
                              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{event.title}</div>
                                  <div className="text-xs text-gray-600">
                                    {format(new Date(event.startTime), "EEE, MMM dd • h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                                <Badge 
                                  className={`${getEventTypeColor(event.eventType)} text-white text-xs`}
                                >
                                  {event.eventType}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No events scheduled for this week</p>
                          <p className="text-xs">Create events using the button above</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}