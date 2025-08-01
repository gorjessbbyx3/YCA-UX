import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Plus, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  campus: z.string().min(1, "Campus is required"),
  maxParticipants: z.number().optional(),
  isRequired: z.boolean().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function Scheduling() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      campus: user?.campus || "oahu",
      maxParticipants: undefined,
      isRequired: false,
    },
  });

  const { data: events = [], isLoading } = useQuery({
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
    createEventMutation.mutate(data);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "graduation": return "bg-gold";
      case "training": return "bg-navy";
      case "community_service": return "bg-island-green";
      case "visitation": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const upcomingEvents = events.filter((event: any) => 
    new Date(event.startTime) > new Date()
  ).slice(0, 5);

  const trainingEvents = events.filter((event: any) => 
    event.eventType === "training"
  );

  const communityEvents = events.filter((event: any) => 
    event.eventType === "community_service"
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Scheduling</h1>
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
                <h1 className="text-2xl font-bold text-navy mb-2">Event Scheduling</h1>
                <p className="text-gray-600">Manage events, training sessions, and campus activities</p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-island-green hover:bg-island-green/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
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
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Event title" {...field} />
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
                                  <SelectItem value="graduation">Graduation</SelectItem>
                                  <SelectItem value="training">Training</SelectItem>
                                  <SelectItem value="community_service">Community Service</SelectItem>
                                  <SelectItem value="visitation">Visitation</SelectItem>
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
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="maxParticipants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Participants</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Leave empty for unlimited"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 pt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Required Event
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Events
                    <Badge variant="secondary" className="ml-auto">
                      {upcomingEvents.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-gray-600">Loading events...</p>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.map((event: any) => (
                        <div key={event.id} className="border-l-4 border-navy pl-3 py-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(event.startTime), "MMM dd, h:mm a")}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </p>
                          )}
                          <Badge 
                            className={`${getEventTypeColor(event.eventType)} text-white text-xs mt-1`}
                          >
                            {event.eventType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Training Sessions
                    <Badge variant="secondary" className="ml-auto">
                      {trainingEvents.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-gray-600">Loading training sessions...</p>
                  ) : trainingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {trainingEvents.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="border-l-4 border-navy pl-3 py-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(event.startTime), "MMM dd, h:mm a")}
                          </p>
                          {event.isRequired && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No training sessions scheduled</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Community Service
                    <Badge variant="secondary" className="ml-auto">
                      {communityEvents.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-gray-600">Loading activities...</p>
                  ) : communityEvents.length > 0 ? (
                    <div className="space-y-3">
                      {communityEvents.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="border-l-4 border-island-green pl-3 py-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(event.startTime), "MMM dd, h:mm a")}
                          </p>
                          {event.maxParticipants && (
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <Users className="w-3 h-3 mr-1" />
                              Max: {event.maxParticipants}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No community service activities</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600">Loading all events...</p>
                ) : events.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Title</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Date & Time</th>
                          <th className="text-left py-2">Location</th>
                          <th className="text-left py-2">Campus</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event: any) => (
                          <tr key={event.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">
                              <div>
                                <p className="font-medium">{event.title}</p>
                                {event.description && (
                                  <p className="text-xs text-gray-600 truncate max-w-xs">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-2">
                              <Badge className={`${getEventTypeColor(event.eventType)} text-white`}>
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-2">
                              <div className="text-xs">
                                <p>{format(new Date(event.startTime), "MMM dd, yyyy")}</p>
                                <p className="text-gray-600">
                                  {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                                </p>
                              </div>
                            </td>
                            <td className="py-2 text-xs">
                              {event.location || "TBD"}
                            </td>
                            <td className="py-2">
                              <Badge variant="outline" className="capitalize">
                                {event.campus}
                              </Badge>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center space-x-1">
                                {event.isRequired && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {new Date(event.startTime) > new Date() ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Upcoming
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Past
                                  </Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No events scheduled</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}