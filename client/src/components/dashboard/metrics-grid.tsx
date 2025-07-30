import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Clock } from "lucide-react";

interface MetricsGridProps {
  campus?: string;
}

export default function MetricsGrid({ campus }: MetricsGridProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics', campus],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Cadets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-white"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cadets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.activeCadets || 0}
              </p>
              <p className="text-xs text-island-green flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                Current enrollment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graduation Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-navy"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Graduation Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.graduationRate || 0}%
              </p>
              <p className="text-xs text-island-green flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                Program success
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Service Hours */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-island-green rounded-lg flex items-center justify-center">
                <i className="fas fa-hands-helping text-white"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Service Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.serviceHours?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">This semester</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Pending */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-alt text-white"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.pendingApplications || 0}
              </p>
              <p className="text-xs text-orange-600 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                Require review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
