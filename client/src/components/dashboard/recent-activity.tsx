import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  campus?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'cadet_activity':
      return { icon: 'fas fa-user', bgColor: 'bg-island-green' };
    case 'system_event':
      return { icon: 'fas fa-file-alt', bgColor: 'bg-navy' };
    case 'graduation':
      return { icon: 'fas fa-graduation-cap', bgColor: 'bg-gold' };
    case 'service':
      return { icon: 'fas fa-hands-helping', bgColor: 'bg-green-500' };
    default:
      return { icon: 'fas fa-info-circle', bgColor: 'bg-gray-500' };
  }
};

export default function RecentActivity({ campus }: RecentActivityProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities', campus],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-100 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
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
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent activity to display
            </p>
          ) : (
            activities?.map((activity: any) => {
              const { icon, bgColor } = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`${icon} text-white text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.title}</span>
                      {activity.description && ` - ${activity.description}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {activities?.length > 0 && (
          <button className="mt-4 text-sm text-navy hover:text-light-navy font-medium">
            View all activity →
          </button>
        )}
      </CardContent>
    </Card>
  );
}