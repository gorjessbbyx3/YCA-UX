import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Edit, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { useState, useMemo } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCadets, setSelectedCadets] = useState<Set<number>>(new Set());
  const [selectedCadet, setSelectedCadet] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: cadets, isLoading } = useQuery({
    queryKey: ['/api/cadets', campus],
  });

  const filteredAndSortedCadets = useMemo(() => {
    if (!cadets) return [];

    let filtered = cadets.filter((cadet: any) => {
      const matchesSearch = searchQuery === "" || 
        `${cadet.firstName} ${cadet.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cadet.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cadet.classNumber?.toString().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || cadet.status === statusFilter;

      const overallProgress = ((parseFloat(cadet.academicProgress) || 0) + 
                              (parseFloat(cadet.fitnessProgress) || 0) + 
                              (parseFloat(cadet.leadershipProgress) || 0)) / 3;
      
      const matchesProgress = progressFilter === "all" ||
        (progressFilter === "excellent" && overallProgress >= 90) ||
        (progressFilter === "good" && overallProgress >= 70 && overallProgress < 90) ||
        (progressFilter === "fair" && overallProgress >= 50 && overallProgress < 70) ||
        (progressFilter === "at-risk" && overallProgress < 50);

      return matchesSearch && matchesStatus && matchesProgress;
    });

    // Sort cadets
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "progress":
          const aProgress = ((parseFloat(a.academicProgress) || 0) + 
                            (parseFloat(a.fitnessProgress) || 0) + 
                            (parseFloat(a.leadershipProgress) || 0)) / 3;
          const bProgress = ((parseFloat(b.academicProgress) || 0) + 
                            (parseFloat(b.fitnessProgress) || 0) + 
                            (parseFloat(b.leadershipProgress) || 0)) / 3;
          return bProgress - aProgress;
        case "serviceHours":
          return (b.serviceHours || 0) - (a.serviceHours || 0);
        case "enrollmentDate":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [cadets, searchQuery, statusFilter, progressFilter, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCadets(new Set(filteredAndSortedCadets.map((c: any) => c.id)));
    } else {
      setSelectedCadets(new Set());
    }
  };

  const handleSelectCadet = (cadetId: number, checked: boolean) => {
    const newSelected = new Set(selectedCadets);
    if (checked) {
      newSelected.add(cadetId);
    } else {
      newSelected.delete(cadetId);
    }
    setSelectedCadets(newSelected);
  };

  const handleBulkExport = () => {
    const selectedCadetData = filteredAndSortedCadets.filter((c: any) => selectedCadets.has(c.id));
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Status,Academic Progress,Fitness Progress,Leadership Progress,Service Hours\n" +
      selectedCadetData.map((c: any) => 
        `"${c.firstName} ${c.lastName}","${c.email || ''}","${c.status}","${c.academicProgress || 0}","${c.fitnessProgress || 0}","${c.leadershipProgress || 0}","${c.serviceHours || 0}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cadets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetailModal = (cadet: any) => {
    setSelectedCadet(cadet);
    setIsDetailModalOpen(true);
  };

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
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or class number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Progress</SelectItem>
                <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                <SelectItem value="good">Good (70-89%)</SelectItem>
                <SelectItem value="fair">Fair (50-69%)</SelectItem>
                <SelectItem value="at-risk">At Risk (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="progress">Sort by Progress</SelectItem>
                <SelectItem value="serviceHours">Sort by Service Hours</SelectItem>
                <SelectItem value="enrollmentDate">Sort by Enrollment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Operations */}
        {selectedCadets.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedCadets.size} cadet{selectedCadets.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Bulk Update
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Cadets ({filteredAndSortedCadets.length})
            </h2>
            <p className="text-sm text-gray-600">
              Manage cadet information and track progress
            </p>
          </div>
          {filteredAndSortedCadets.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCadets.size === filteredAndSortedCadets.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredAndSortedCadets.map((cadet: any) => (
          <Card key={cadet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedCadets.has(cadet.id)}
                    onCheckedChange={(checked) => handleSelectCadet(cadet.id, checked as boolean)}
                  />
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
                    <Button variant="outline" size="sm" onClick={() => openDetailModal(cadet)}>
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

      {/* Cadet Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCadet && `${selectedCadet.firstName} ${selectedCadet.lastName}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCadet && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedCadet.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedCadet.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{selectedCadet.dateOfBirth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedCadet.status)}>
                        {selectedCadet.status.charAt(0).toUpperCase() + selectedCadet.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Campus:</span>
                      <span>{selectedCadet.campus?.charAt(0).toUpperCase() + selectedCadet.campus?.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Class Number:</span>
                      <span>{selectedCadet.classNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Start Date:</span>
                      <span>{selectedCadet.startDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Service Hours:</span>
                      <span className="font-semibold text-island-green">{selectedCadet.serviceHours || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Academic Progress</span>
                        <span className="text-sm text-gray-600">{selectedCadet.academicProgress || 0}%</span>
                      </div>
                      <Progress value={parseFloat(selectedCadet.academicProgress) || 0} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Fitness Progress</span>
                        <span className="text-sm text-gray-600">{selectedCadet.fitnessProgress || 0}%</span>
                      </div>
                      <Progress value={parseFloat(selectedCadet.fitnessProgress) || 0} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Leadership Progress</span>
                        <span className="text-sm text-gray-600">{selectedCadet.leadershipProgress || 0}%</span>
                      </div>
                      <Progress value={parseFloat(selectedCadet.leadershipProgress) || 0} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{selectedCadet.emergencyContactName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{selectedCadet.emergencyContactPhone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Relation:</span>
                    <span>{selectedCadet.emergencyContactRelation || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCadet.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedCadet.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button className="bg-navy hover:bg-light-navy">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Cadet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
