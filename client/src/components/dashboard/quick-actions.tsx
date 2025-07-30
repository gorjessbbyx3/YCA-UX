import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarPlus, BarChart3, ClipboardCheck } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href="/cadets">
            <Button className="w-full justify-between bg-navy hover:bg-light-navy">
              <span className="flex items-center">
                <UserPlus className="mr-3 h-4 w-4" />
                Add New Cadet
              </span>
              <i className="fas fa-arrow-right"></i>
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center">
              <CalendarPlus className="mr-3 h-4 w-4" />
              Schedule Event
            </span>
            <i className="fas fa-arrow-right"></i>
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center">
              <BarChart3 className="mr-3 h-4 w-4" />
              Generate Report
            </span>
            <i className="fas fa-arrow-right"></i>
          </Button>
          
          <Link href="/applications">
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center">
                <ClipboardCheck className="mr-3 h-4 w-4" />
                Review Applications
              </span>
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
