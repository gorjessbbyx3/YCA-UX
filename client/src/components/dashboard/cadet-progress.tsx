import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CadetProgress() {
  // This would typically come from an API call
  const progressData = [
    { name: 'Academic Excellence', value: 78, color: 'bg-navy' },
    { name: 'Physical Fitness', value: 82, color: 'bg-island-green' },
    { name: 'Leadership Development', value: 71, color: 'bg-gold' },
    { name: 'Community Service', value: 91, color: 'bg-green-500' },
  ];

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
