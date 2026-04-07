import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, TrendingUp, Users, ChevronRight, MoreVertical, Clock, Star, KeyRound, Shield, LogOut, Zap, Calendar, ArrowRight, ChevronsLeft, ChevronsRight, PenLine, Sparkles, LayoutTemplate, FileUp, Layers, RefreshCw } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { motion } from "framer-motion";
import { tokenApi, TokenInfo } from "@/services/tokenApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/courseed-logo.png";
import { brandingService, BrandingSettings } from "@/services/brandingService";
import { CreateCourseDialog } from "@/components/Dashboard/CreateCourseDialog";

const mockCourses = [
  { id: 1, title: "Carbon Accounting-ACCA", thumbnail: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop", students: 234, progress: 85, lastUpdated: "2 days ago" },
  { id: 2, title: "Budgeting in Management", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop", students: 189, progress: 92, lastUpdated: "1 week ago" },
  { id: 3, title: "carbon accounting-0810-01", thumbnail: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&h=300&fit=crop", students: 456, progress: 78, lastUpdated: "3 days ago" },
  { id: 4, title: "carbon accounting-0810", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop", students: 312, progress: 88, lastUpdated: "5 days ago" },
  { id: 5, title: "Carbon Accounting-0710", thumbnail: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop", students: 523, progress: 95, lastUpdated: "1 day ago" },
  { id: 6, title: "Financial Analysis Fundamentals", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", students: 398, progress: 82, lastUpdated: "4 days ago" },
  { id: 7, title: "Advanced Cost Management", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", students: 276, progress: 76, lastUpdated: "6 days ago" },
  { id: 8, title: "Taxation and Compliance 2024", thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop", students: 419, progress: 91, lastUpdated: "3 hours ago" },
  { id: 9, title: "Strategic Financial Planning", thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop", students: 345, progress: 68, lastUpdated: "2 weeks ago" },
  { id: 10, title: "Auditing Standards & Practices", thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop", students: 502, progress: 94, lastUpdated: "12 hours ago" },
  { id: 11, title: "Corporate Finance Essentials", thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop", students: 287, progress: 73, lastUpdated: "1 week ago" },
  { id: 12, title: "Management Accounting Pro", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", students: 431, progress: 87, lastUpdated: "5 days ago" },
  { id: 13, title: "International Financial Reporting", thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop", students: 364, progress: 79, lastUpdated: "8 days ago" },
  { id: 14, title: "Risk Assessment & Control", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop", students: 215, progress: 65, lastUpdated: "10 days ago" },
  { id: 15, title: "Financial Forecasting Methods", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop", students: 478, progress: 89, lastUpdated: "4 hours ago" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number | 'all'>(10);
  const [activeTab, setActiveTab] = useState("all");
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false);
  const [tokenData, setTokenData] = useState<TokenInfo>({
    renewedOn: "Loading...",
    totalTokens: 0,
    availableTokens: 0,
    consumedTokens: 0,
    carriedForward: 0,
  });
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);

  // Load branding settings
  useEffect(() => {
    setBranding(brandingService.getCurrentBranding());
    const unsubscribe = brandingService.subscribe((newBranding) => {
      setBranding(newBranding);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoadingTokens(true);
        const data = await tokenApi.getHomeTokenInfo("0");
        setTokenData(data);
      } catch (error) {
        console.error("Failed to fetch token info:", error);
        toast({
          title: "Error",
          description: "Failed to load token information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTokens(false);
      }
    };
    fetchTokenInfo();
  }, [toast]);

  const usagePercentage = tokenData.totalTokens > 0 
    ? (tokenData.consumedTokens / tokenData.totalTokens) * 100 
    : 0;

  // Pagination logic
  const filteredCourses = mockCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const effectiveRecordsPerPage = recordsPerPage === 'all' ? filteredCourses.length : recordsPerPage;
  const totalPages = Math.ceil(filteredCourses.length / effectiveRecordsPerPage);
  const startIndex = (currentPage - 1) * effectiveRecordsPerPage;
  const endIndex = startIndex + effectiveRecordsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(value === 'all' ? 'all' : Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-accent/[0.06] blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog 
        open={isCreateCourseDialogOpen} 
        onOpenChange={setIsCreateCourseDialogOpen} 
      />

      {/* Token Usage Dialog */}
      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Zap className="w-6 h-6 text-primary" />
              Tokens Usage
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Renewed On</span>
              </div>
              <span className="text-sm font-bold text-foreground">{tokenData.renewedOn}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Usage Overview</span>
                <span className="text-sm font-medium text-muted-foreground">{usagePercentage.toFixed(1)}% Used</span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-primary/30">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Total Tokens</p>
                  <p className="text-2xl font-bold text-foreground">{tokenData.totalTokens.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-primary">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium">Allocated</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-500/30 dark:border-green-400/30">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Available Tokens</p>
                  <p className="text-2xl font-bold text-foreground">{tokenData.availableTokens.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                    <span className="text-xs font-medium">Ready to use</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-500/30 dark:border-orange-400/30">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Consumed Tokens</p>
                  <p className="text-2xl font-bold text-foreground">{tokenData.consumedTokens.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400" />
                    <span className="text-xs font-medium">Used</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Tokens carried forward from previous allotment</span>
              <span className="text-sm font-bold text-foreground">{tokenData.carriedForward.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Token Distribution</p>
              <div className="flex h-3 rounded-full overflow-hidden border border-border">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600" 
                  style={{ width: `${usagePercentage}%` }}
                  title={`Consumed: ${tokenData.consumedTokens.toLocaleString()}`}
                />
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600" 
                  style={{ width: `${100 - usagePercentage}%` }}
                  title={`Available: ${tokenData.availableTokens.toLocaleString()}`}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-orange-600" />
                  <span className="text-muted-foreground">Consumed ({usagePercentage.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-green-600" />
                  <span className="text-muted-foreground">Available ({(100 - usagePercentage).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Header 
        showTokens 
        onTokenClick={() => setIsTokenDialogOpen(true)} 
        tokenCount={isLoadingTokens ? "Loading..." : tokenData.availableTokens.toLocaleString()} 
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-border/60 px-7 py-5">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px]" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/[0.08] blur-[60px]" />

            <div className="relative flex items-center justify-between gap-4">
              <h1 className="text-[22px] font-medium tracking-[-0.03em] flex items-center gap-1.5" style={{ fontFamily: "'Geist', sans-serif" }}>
                <span className="bg-gradient-to-r from-primary via-[hsl(240,70%,55%)] to-[hsl(280,80%,55%)] bg-clip-text text-transparent">Welcome back, Admin</span>
                <span>👋</span>
              </h1>

              <div className="flex items-center gap-3 bg-background/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/40">
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span><span className="font-semibold text-foreground">13</span> courses created</span>
                </div>
                <span className="w-px h-3.5 bg-border" />
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-primary">+2</span>
                  <span>this month</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card className="relative p-6 mb-8 border border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Decorative Diagonal Ribbon */}
            <div className="absolute -right-9 top-5 rotate-45 w-36 h-8 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-md flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-sm">Quick Start</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pr-0 sm:pr-8">
              <div className="pr-8 sm:pr-0">
                <h2 className="text-xl font-bold text-foreground mb-1">Ready to create something amazing?</h2>
                <p className="text-sm text-muted-foreground">Start a new course or continue where you left off</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-[0px_4px_20px_2px_rgba(0,90,200,0.15)] hover:shadow-[0px_6px_24px_4px_rgba(0,90,200,0.2)] transition-all">
                      <Plus className="w-4 h-4" />
                      Create Course
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50 w-[300px] bg-background border border-border p-2 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => setIsCreateCourseDialogOpen(true)}
                      className="cursor-pointer gap-4 px-4 py-3.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground rounded-md"
                    >
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0">
                        <PenLine className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Manual Generation</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">Create your course step by step</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-4 px-4 py-3.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground rounded-md"
                    >
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0">
                        <AISparkles className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Generate using AI</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">Turn your ideas into a course with AI</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full border border-border hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Header and Search */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <h2 className="text-2xl font-bold text-foreground tracking-[-0.02em]">All Courses</h2>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 rounded-full border border-border bg-card/80 backdrop-blur-sm focus:border-primary/50 focus-visible:ring-primary/20"
            />
          </div>
        </motion.div>

        {/* Pagination Info and Controls */}
        {filteredCourses.length > 0 && (
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/80"
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium">
                Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to{" "}
                <span className="text-foreground font-semibold">{Math.min(endIndex, filteredCourses.length)}</span> of{" "}
                <span className="text-foreground font-semibold">{filteredCourses.length}</span> courses
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Show:</span>
              <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                <SelectTrigger className="w-20 h-9 rounded-full border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Courses Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-8"
        >
          {currentCourses.map((course) => (
            <motion.div key={course.id} variants={cardItem}>
              <Card 
                onClick={() => navigate(`/edit-course/${course.id}`)}
                className="group overflow-hidden transition-all duration-300 cursor-pointer border border-border/80 hover:border-primary/30 hover:shadow-lg bg-card/80 backdrop-blur-sm rounded-2xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-5 space-y-3.5">
                  <h4 className="font-semibold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
                    {course.title}
                  </h4>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{course.lastUpdated}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs px-3 gap-1.5 font-semibold rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all"
                    >
                      View
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No courses match "${searchQuery}". Try a different search term.`
                  : "No courses available yet."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-full"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination Controls */}
        {filteredCourses.length > 0 && (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/80"
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground font-medium">Total Courses:</span>
              <span className="text-sm font-semibold text-foreground">{filteredCourses.length}</span>
            </div>

            {recordsPerPage !== 'all' && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 rounded-full border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={`h-8 text-xs rounded-full border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                      }`}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="h-8 w-8" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className={`h-8 w-8 cursor-pointer border text-xs rounded-full ${
                            currentPage === page
                              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                              : 'border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary'
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={`h-8 text-xs rounded-full border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                      }`}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 rounded-full border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground font-medium">Records Per Page:</span>
              <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                <SelectTrigger className="w-20 h-8 text-xs rounded-full border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      {(!branding || branding.brandingOption === "excelsoft" || branding.brandingOption === "both") && (
        <footer className="relative z-10 mt-auto border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Powered By</span>
              <img 
                src={logo} 
                alt="courseED Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Dashboard;
