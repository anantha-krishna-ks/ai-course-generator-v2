import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import CreateCourseMultipage from "./pages/CreateCourseMultipage";
import CreateCourseSinglepage from "./pages/CreateCourseSinglepage";
import MultipageCoursePreview from "./pages/MultipageCoursePreview";
import SinglepageCoursePreview from "./pages/SinglepageCoursePreview";
import EditCourse from "./pages/EditCourse";
import CoursePreview from "./pages/CoursePreview";
import Blueprints from "./pages/Blueprints";
import CreateBlueprint from "./pages/CreateBlueprint";
import BlueprintEditor from "./pages/BlueprintEditor";
import TokenManagement from "./pages/TokenManagement";
import AdminModule from "./pages/AdminModule";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import AIGenerateCourse from "./pages/AIGenerateCourse";
import AIGeneratedCourse from "./pages/AIGeneratedCourse";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
          <Route path="/create-course-multipage" element={<ProtectedRoute><CreateCourseMultipage /></ProtectedRoute>} />
          <Route path="/create-course-singlepage" element={<ProtectedRoute><CreateCourseSinglepage /></ProtectedRoute>} />
          <Route path="/multipage-preview" element={<ProtectedRoute><MultipageCoursePreview /></ProtectedRoute>} />
          <Route path="/singlepage-preview" element={<ProtectedRoute><SinglepageCoursePreview /></ProtectedRoute>} />
          <Route path="/edit-course/:courseId" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
          <Route path="/course-preview/:courseId" element={<ProtectedRoute><CoursePreview /></ProtectedRoute>} />
          <Route path="/blueprints" element={<ProtectedRoute><Blueprints /></ProtectedRoute>} />
          <Route path="/create-blueprint" element={<ProtectedRoute><CreateBlueprint /></ProtectedRoute>} />
          <Route path="/blueprint-editor/:blueprintId" element={<ProtectedRoute><BlueprintEditor /></ProtectedRoute>} />
          <Route path="/token-management" element={<ProtectedRoute><TokenManagement /></ProtectedRoute>} />
          <Route path="/admin-module" element={<ProtectedRoute><AdminModule /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/ai-generate-course" element={<ProtectedRoute><AIGenerateCourse /></ProtectedRoute>} />
          <Route path="/ai-generated-course" element={<ProtectedRoute><AIGeneratedCourse /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
