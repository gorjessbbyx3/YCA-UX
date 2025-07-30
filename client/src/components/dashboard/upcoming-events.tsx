import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface UpcomingEventsProps {
  campus?: string;
}

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'graduation':
      return 'bg-navy';
    case 'community_service':
      return 'bg-island-green';
    case 'visitation':
      return 'bg-gold';
    case 'training':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default function UpcomingEvents({ campus }: UpcomingEventsProps) {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next 30 days

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events', campus, startDate.toISOString(), endDate.toISOString()],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No upcoming events scheduled
            </p>
          ) : (
            events?.slice(0, 5).map((event: any) => {
              const eventDate = new Date(event.startTime);
              const colorClass = getEventTypeColor(event.eventType);
              
              return (
                <div key={event.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex flex-col items-center justify-center text-white`}>
                    <span className="text-xs font-medium">
                      {format(eventDate, 'MMM').toUpperCase()}
                    </span>
                    <span className="text-sm font-bold">
                      {format(eventDate, 'd')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">
                      {format(eventDate, 'h:mm a')} - {event.location}
                    </p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              );
            })
          )}
        </div>
        {events?.length > 0 && (
          <button className="mt-4 text-sm text-navy hover:text-light-navy font-medium">
            View all events →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
