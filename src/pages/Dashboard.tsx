import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, TrendingUp, Users, ChevronRight, MoreVertical, Clock, Star, KeyRound, Shield, LogOut, Zap, Calendar, ArrowRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

const mockCourses = [
  { id: 1, title: "Carbon Accounting-ACCA", thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop", students: 234, progress: 85, lastUpdated: "2 days ago" },
  { id: 2, title: "Budgeting in Management", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", students: 189, progress: 92, lastUpdated: "1 week ago" },
  { id: 3, title: "carbon accounting-0810-01", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", students: 456, progress: 78, lastUpdated: "3 days ago" },
  { id: 4, title: "carbon accounting-0810", thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop", students: 312, progress: 88, lastUpdated: "5 days ago" },
  { id: 5, title: "Carbon Accounting-0710", thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop", students: 523, progress: 95, lastUpdated: "1 day ago" },
  { id: 6, title: "Financial Analysis Fundamentals", thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop", students: 398, progress: 82, lastUpdated: "4 days ago" },
  { id: 7, title: "Advanced Cost Management", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", students: 276, progress: 76, lastUpdated: "6 days ago" },
  { id: 8, title: "Taxation and Compliance 2024", thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop", students: 419, progress: 91, lastUpdated: "3 hours ago" },
  { id: 9, title: "Strategic Financial Planning", thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop", students: 345, progress: 68, lastUpdated: "2 weeks ago" },
  { id: 10, title: "Auditing Standards & Practices", thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop", students: 502, progress: 94, lastUpdated: "12 hours ago" },
  { id: 11, title: "Corporate Finance Essentials", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop", students: 287, progress: 73, lastUpdated: "1 week ago" },
  { id: 12, title: "Management Accounting Pro", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", students: 431, progress: 87, lastUpdated: "5 days ago" },
  { id: 13, title: "International Financial Reporting", thumbnail: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=300&fit=crop", students: 364, progress: 79, lastUpdated: "8 days ago" },
  { id: 14, title: "Risk Assessment & Control", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop", students: 215, progress: 65, lastUpdated: "10 days ago" },
  { id: 15, title: "Financial Forecasting Methods", thumbnail: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop", students: 478, progress: 89, lastUpdated: "4 hours ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number | 'all'>(10);
  const [activeTab, setActiveTab] = useState("all");
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
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

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Reset to page 1 when records per page changes
  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(value === 'all' ? 'all' : Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
    <div className="min-h-screen bg-background">
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
            {/* Renewal Date */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Renewed On</span>
              </div>
              <span className="text-sm font-bold text-foreground">{tokenData.renewedOn}</span>
            </div>

            {/* Usage Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Usage Overview</span>
                <span className="text-sm font-medium text-muted-foreground">{usagePercentage.toFixed(1)}% Used</span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
            </div>

            {/* Stats Grid */}
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

            {/* Carried Forward Info */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Tokens carried forward from previous allotment</span>
              <span className="text-sm font-bold text-foreground">{tokenData.carriedForward.toLocaleString()}</span>
            </div>

            {/* Visual Breakdown */}
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="relative p-6 overflow-hidden border border-primary/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:border-primary/40 transition-all">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5" />
            
            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Courses</span>
                </div>
                
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1">13</p>
                  <p className="text-sm text-muted-foreground">Total courses created</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">+2</span>
                  </div>
                  <span className="text-xs text-muted-foreground">added this month</span>
                </div>
              </div>
              
              <div className="w-16 h-16 rounded-3xl bg-white/80 backdrop-blur-sm flex items-center justify-center border border-primary/20 shadow-sm">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="relative p-6 overflow-hidden border border-green-500/20 dark:border-green-400/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:border-green-500/40 dark:hover:border-green-400/40 transition-all">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-green-500/10 dark:bg-green-400/10" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-green-500/5 dark:bg-green-400/5" />
            
            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 dark:bg-green-400/10 border border-green-500/20 dark:border-green-400/20">
                  <Zap className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Tokens</span>
                </div>
                
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1">
                    {isLoadingTokens ? "..." : tokenData.availableTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Available tokens</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 dark:bg-green-400/10">
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {isLoadingTokens ? "..." : `${usagePercentage.toFixed(0)}%`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">used so far</span>
                </div>
              </div>
              
              <div className="w-16 h-16 rounded-3xl bg-white/80 backdrop-blur-sm flex items-center justify-center border border-green-500/20 dark:border-green-400/20 shadow-sm">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="relative p-6 mb-8 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
          {/* Decorative Diagonal Ribbon */}
          <div className="absolute -right-9 top-5 rotate-45 w-36 h-8 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-md flex items-center justify-center z-10">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-sm">Quick Start</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pr-0 sm:pr-8">
            <div className="pr-8 sm:pr-0">
              <h2 className="text-xl font-bold text-foreground mb-1">Ready to create something amazing?</h2>
              <p className="text-sm text-muted-foreground">Start a new course or explore existing blueprints</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => navigate("/create-course")}
              >
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                onClick={() => navigate("/blueprints")}
              >
                <BookOpen className="w-4 h-4" />
                Browse Blueprints
              </Button>
            </div>
          </div>
        </Card>

        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">All Courses</h2>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 border border-primary/30 focus:border-primary/50 bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Pagination Info and Controls */}
        {filteredCourses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 via-background to-accent/5 border border-primary/20">
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
                <SelectTrigger className="w-20 h-9 border-primary/30 focus:border-primary/50">
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
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-8">
          {currentCourses.map((course) => {
            const colorScheme = { 
              badge: "bg-primary", 
              progress: "bg-primary", 
              border: "border-primary/20", 
              hoverBg: "hover:border-primary/40" 
            };
            
            return (
              <Card 
                key={course.id} 
                onClick={() => navigate(`/edit-course/${course.id}`)}
                className={`group overflow-hidden transition-all duration-300 cursor-pointer border ${colorScheme.border} ${colorScheme.hoverBg} hover:shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
                      className="h-8 text-xs px-3 gap-1.5 font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-all"
                    >
                      View
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          
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
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredCourses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-lg bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/20">
            {/* Total Courses */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground font-medium">Total Courses:</span>
              <span className="text-sm font-semibold text-foreground">{filteredCourses.length}</span>
            </div>

            {/* Pagination */}
            {recordsPerPage !== 'all' && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {/* First Page */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>
                  </PaginationItem>

                  {/* Previous */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={`h-8 text-xs border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                      }`}
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
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
                          className={`h-8 w-8 cursor-pointer border text-xs ${
                            currentPage === page
                              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                              : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary'
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  {/* Next */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={`h-8 text-xs border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                      }`}
                    />
                  </PaginationItem>

                  {/* Last Page */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Records Per Page */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground font-medium">Records Per Page:</span>
              <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                <SelectTrigger className="w-20 h-8 text-xs border-primary/30 focus:border-primary/50">
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
          </div>
        )}
      </div>

      {/* Footer */}
      {/* Show Excelsoft logo when: Excelsoft Logo Only OR Both Logos selected */}
      {(!branding || branding.brandingOption === "excelsoft" || branding.brandingOption === "both") && (
        <footer className="mt-auto border-t border-border/50 bg-muted/80">
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
