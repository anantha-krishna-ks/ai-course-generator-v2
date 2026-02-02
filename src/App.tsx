import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CoursePreview from "./pages/CoursePreview";
import Blueprints from "./pages/Blueprints";
import CreateBlueprint from "./pages/CreateBlueprint";
import BlueprintEditor from "./pages/BlueprintEditor";
import TokenManagement from "./pages/TokenManagement";
import AdminModule from "./pages/AdminModule";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/edit-course/:courseId" element={<EditCourse />} />
          <Route path="/course-preview/:courseId" element={<CoursePreview />} />
          <Route path="/blueprints" element={<Blueprints />} />
          <Route path="/create-blueprint" element={<CreateBlueprint />} />
          <Route path="/blueprint-editor/:blueprintId" element={<BlueprintEditor />} />
          <Route path="/token-management" element={<TokenManagement />} />
          <Route path="/admin-module" element={<AdminModule />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/users" element={<Users />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
