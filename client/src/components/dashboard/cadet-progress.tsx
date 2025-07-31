import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CadetProgress() {
  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['cadet-progress'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cadets');
      const cadets = await response.json();

      if (!cadets.length) return [];

      // Calculate average progress across all cadets
      const avgAcademic = cadets.reduce((sum: number, cadet: any) => sum + (cadet.academicProgress || 0), 0) / cadets.length;
      const avgFitness = cadets.reduce((sum: number, cadet: any) => sum + (cadet.fitnessProgress || 0), 0) / cadets.length;
      const avgLeadership = cadets.reduce((sum: number, cadet: any) => sum + (cadet.leadershipProgress || 0), 0) / cadets.length;
      const avgService = cadets.reduce((sum: number, cadet: any) => sum + (cadet.serviceHours || 0), 0) / cadets.length;

      return [
        { name: "Academic Progress", value: Math.round(avgAcademic), color: "bg-blue-500" },
        { name: "Physical Fitness", value: Math.round(avgFitness), color: "bg-green-500" },
        { name: "Leadership Skills", value: Math.round(avgLeadership), color: "bg-yellow-500" },
        { name: "Community Service", value: Math.round(Math.min(avgService, 100)), color: "bg-purple-500" },
      ];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Class Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
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
        <CardTitle>Current Class Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressData.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <span className="text-sm text-gray-600">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-soft-gold rounded-lg">
          <p className="text-sm text-gray-700">
            <i className="fas fa-info-circle text-gold mr-2"></i>
            Current class is 16 weeks into the 22-week program
          </p>
        </div>
      </CardContent>
    </Card>
  );
}