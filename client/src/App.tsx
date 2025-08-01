import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import CadetManagement from "@/pages/cadet-management";
import Applications from "@/pages/applications";
import Scheduling from "@/pages/scheduling";
import Calendar from "@/pages/calendar";
import CadetDashboard from "@/pages/cadet-dashboard";
import Academics from "@/pages/academics";
import Mentorship from "@/pages/mentorship";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/cadets" component={CadetManagement} />
          <Route path="/cadet/:id" component={CadetDashboard} />
          <Route path="/applications" component={Applications} />
          <Route path="/scheduling" component={Scheduling} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/academics" component={Academics} />
          <Route path="/mentorship" component={Mentorship} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/reports" component={Reports} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
