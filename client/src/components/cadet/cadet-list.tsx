import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit } from "lucide-react";

interface CadetListProps {
  campus?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'graduated':
      return 'bg-blue-500';
    case 'dismissed':
      return 'bg-red-500';
    case 'withdrawn':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

export default function CadetList({ campus }: CadetListProps) {
  const { data: cadets, isLoading } = useQuery({
    queryKey: ['/api/cadets', campus],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!cadets || cadets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cadets Found</h3>
          <p className="text-gray-600 mb-4">
            There are no cadets registered for the selected campus yet.
          </p>
          <Button className="bg-navy hover:bg-light-navy">
            <i className="fas fa-user-plus mr-2"></i>
            Add First Cadet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            All Cadets ({cadets.length})
          </h2>
          <p className="text-sm text-gray-600">
            Manage cadet information and track progress
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {cadets.map((cadet: any) => (
          <Card key={cadet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {cadet.firstName[0]}{cadet.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cadet.firstName} {cadet.lastName}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="outline" className={getStatusColor(cadet.status)}>
                        {cadet.status.charAt(0).toUpperCase() + cadet.status.slice(1)}
                      </Badge>
                      {cadet.classNumber && (
                        <span className="text-sm text-gray-500">
                          Class {cadet.classNumber}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {cadet.serviceHours || 0} service hours
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Overall Progress</p>
                    <div className="w-32">
                      <Progress 
                        value={
                          ((parseFloat(cadet.academicProgress) || 0) + 
                           (parseFloat(cadet.fitnessProgress) || 0) + 
                           (parseFloat(cadet.leadershipProgress) || 0)) / 3
                        } 
                        className="h-2 mt-1" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Academic</p>
                    <Progress value={parseFloat(cadet.academicProgress) || 0} className="h-1" />
                    <span className="text-xs text-gray-500">{cadet.academicProgress || 0}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Fitness</p>
                    <Progress value={parseFloat(cadet.fitnessProgress) || 0} className="h-1" />
                    <span className="text-xs text-gray-500">{cadet.fitnessProgress || 0}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Leadership</p>
                    <Progress value={parseFloat(cadet.leadershipProgress) || 0} className="h-1" />
                    <span className="text-xs text-gray-500">{cadet.leadershipProgress || 0}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Service Hours</p>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-island-green">
                        {cadet.serviceHours || 0}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">/ 100 hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
