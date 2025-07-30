import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle, Clock, Brain } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ApplicationListProps {
  campus?: string;
  status?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'under_review':
      return 'bg-blue-500';
    case 'approved':
      return 'bg-green-500';
    case 'denied':
      return 'bg-red-500';
    case 'waitlisted':
      return 'bg-orange-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'under_review':
      return 'Under Review';
    case 'waitlisted':
      return 'Waitlisted';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function ApplicationList({ campus, status }: ApplicationListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/applications', status, campus],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, {
        status,
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Application review has been submitted.",
      });
      setIsReviewDialogOpen(false);
      setReviewNotes("");
      setReviewStatus("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeApplication = async (applicationId: number) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", `/api/applications/${applicationId}/analyze`);
      const data = await response.json();
      setAnalysisResult(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for this application.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReview = (application: any) => {
    setSelectedApplication(application);
    setReviewNotes(application.reviewNotes || "");
    setReviewStatus(application.status);
    setAnalysisResult("");
    setIsReviewDialogOpen(true);
  };

  const submitReview = () => {
    if (!selectedApplication || !reviewStatus) return;
    
    reviewMutation.mutate({
      id: selectedApplication.id,
      status: reviewStatus,
      notes: reviewNotes,
    });
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

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-alt text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600 mb-4">
            {status 
              ? `There are no ${status} applications for the selected campus yet.`
              : "There are no applications for the selected campus yet."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({applications.length})
            </h2>
            <p className="text-sm text-gray-600">
              Review and process cadet applications
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {applications.map((application: any) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {application.firstName[0]}{application.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {application.firstName} {application.lastName}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge className={`${getStatusColor(application.status)} text-white`}>
                          {getStatusText(application.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {application.preferredCampus === 'oahu' ? 'Oahu Campus' : 'Hilo Job Challenge'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Age: {new Date().getFullYear() - new Date(application.dateOfBirth).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Submitted {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                      </p>
                      {application.reviewedAt && (
                        <p className="text-xs text-gray-500">
                          Reviewed {format(new Date(application.reviewedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReview(application)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Application Summary */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Contact</p>
                      <p className="text-sm text-gray-900">{application.email}</p>
                      <p className="text-sm text-gray-900">{application.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Location</p>
                      <p className="text-sm text-gray-900">
                        {application.city}, {application.state} {application.zipCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Parent/Guardian</p>
                      <p className="text-sm text-gray-900">{application.parentGuardianName}</p>
                      <p className="text-sm text-gray-900">{application.parentGuardianPhone}</p>
                    </div>
                  </div>
                  
                  {application.reasonForApplying && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Reason for Applying</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {application.reasonForApplying}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Application - {selectedApplication?.firstName} {selectedApplication?.lastName}
            </DialogTitle>
            <DialogDescription>
              Review the application details and provide your assessment.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                      <p className="text-sm">{format(new Date(selectedApplication.dateOfBirth), 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-sm">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p className="text-sm">
                        {selectedApplication.address}<br />
                        {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zipCode}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Preferred Campus</Label>
                      <p className="text-sm">
                        {selectedApplication.preferredCampus === 'oahu' ? 'Oahu Campus (Kalaeloa)' : 'Hilo Job Challenge'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent/Guardian Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Parent/Guardian Name</Label>
                      <p className="text-sm">{selectedApplication.parentGuardianName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{selectedApplication.parentGuardianPhone}</p>
                    </div>
                    {selectedApplication.parentGuardianEmail && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-sm">{selectedApplication.parentGuardianEmail}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              {(selectedApplication.currentSchool || selectedApplication.gradeLevel) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Academic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.currentSchool && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Current School</Label>
                          <p className="text-sm">{selectedApplication.currentSchool}</p>
                        </div>
                      )}
                      {selectedApplication.gradeLevel && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Grade Level</Label>
                          <p className="text-sm">{selectedApplication.gradeLevel}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Essays */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Essays</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedApplication.reasonForApplying && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Reason for Applying</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                        {selectedApplication.reasonForApplying}
                      </p>
                    </div>
                  )}
                  {selectedApplication.previousChallenges && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Previous Challenges</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                        {selectedApplication.previousChallenges}
                      </p>
                    </div>
                  )}
                  {selectedApplication.goals && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Goals</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                        {selectedApplication.goals}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Analysis (Powered by xAI Grok)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Get intelligent insights about this application using advanced AI analysis
                  </p>
                </CardHeader>
                <CardContent>
                  {!analysisResult ? (
                    <Button 
                      onClick={() => analyzeApplication(selectedApplication.id)}
                      disabled={isAnalyzing}
                      className="bg-island-green hover:bg-island-green/90 w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Analyzing Application with xAI Grok...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate AI Analysis
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-800 mb-2">AI Analysis Results:</h4>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{analysisResult}</pre>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setAnalysisResult("");
                          analyzeApplication(selectedApplication.id);
                        }}
                        variant="outline"
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Regenerate Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Application Status</Label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Review Notes</Label>
                    <Textarea
                      id="notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter your review notes and recommendations..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReviewDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={submitReview}
                      disabled={!reviewStatus || reviewMutation.isPending}
                      className="bg-navy hover:bg-light-navy"
                    >
                      {reviewMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
