import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, ImageIcon, CheckCircle2, Clock, MoreVertical, User, Layers, Home, ChevronRight, Loader2, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Header from "@/components/Header";
import { blueprintApi, BlueprintApiError } from "@/services/blueprintApi";
import { BlueprintListItem } from "@/types/blueprint";
import { useToast } from "@/hooks/use-toast";
import { demoBlueprintStore } from "@/services/demoBlueprintStore";

// Dummy data for testing
const dummyBlueprints: BlueprintListItem[] = [
  {
    Id: "dummy-1",
    Title: "Introduction to Machine Learning",
    BlueprintStatus: 1,
    BlueprintType: 1,
    CreatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    UpdatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    NoOfLevels: 4,
  },
  {
    Id: "dummy-2",
    Title: "Advanced Web Development",
    BlueprintStatus: 0,
    BlueprintType: 1,
    CreatedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    UpdatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    NoOfLevels: 5,
  },
  {
    Id: "dummy-3",
    Title: "Data Science Fundamentals",
    BlueprintStatus: 1,
    BlueprintType: 1,
    CreatedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    UpdatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    NoOfLevels: 3,
  },
];

const Blueprints = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blueprints, setBlueprints] = useState<BlueprintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number | 'all'>(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [levelsFilter, setLevelsFilter] = useState<'all' | string>('all');

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    setIsLoading(true);
    try {
      const response = await blueprintApi.getBlueprints(100, 1, -1);
      setBlueprints(response.Entity || []);
      setTotalRecords(response.TotalRecords);
    } catch (error) {
      console.error("Failed to fetch blueprints:", error);
      
      // DEMO fallback: use base dummy blueprints + locally stored clones
      const clones = demoBlueprintStore.getClones();
      const merged = [...dummyBlueprints, ...clones]
        .sort((a, b) => new Date(b.UpdatedDate).getTime() - new Date(a.UpdatedDate).getTime());
      
      setBlueprints(merged);
      setTotalRecords(merged.length);
      
      if (error instanceof BlueprintApiError && error.statusCode === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view blueprints.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Load Blueprints",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "Published" : "Draft";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Last edited • Today";
    if (diffDays === 1) return "Last edited • Yesterday";
    if (diffDays < 7) return `Last edited • ${diffDays} days ago`;
    if (diffDays < 14) return "Last edited • 1 week ago";
    if (diffDays < 30) return `Last edited • ${Math.floor(diffDays / 7)} weeks ago`;
    
    return `Last edited • ${date.toLocaleDateString()}`;
  };
  
  const totalBlueprints = blueprints.length;
  const publishedCount = blueprints.filter(b => b.BlueprintStatus === 1).length;
  const draftCount = blueprints.filter(b => b.BlueprintStatus === 0).length;

  // Get unique hierarchy levels for filter
  const uniqueLevels = Array.from(new Set(blueprints.map(b => b.NoOfLevels).filter(Boolean))).sort((a, b) => a! - b!);

  // Filter and sort blueprints
  const allFilteredBlueprints = blueprints
    .filter(blueprint => {
      // Status filter
      if (statusFilter === 'published' && blueprint.BlueprintStatus !== 1) return false;
      if (statusFilter === 'draft' && blueprint.BlueprintStatus !== 0) return false;
      
      // Search filter
      if (searchQuery && !blueprint.Title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Levels filter
      if (levelsFilter !== 'all' && blueprint.NoOfLevels !== Number(levelsFilter)) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.UpdatedDate).getTime() - new Date(a.UpdatedDate).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.UpdatedDate).getTime() - new Date(b.UpdatedDate).getTime();
      } else if (sortBy === 'title') {
        return a.Title.localeCompare(b.Title);
      }
      return 0;
    });

  // Pagination logic
  const effectiveRecordsPerPage = recordsPerPage === 'all' ? allFilteredBlueprints.length : recordsPerPage;
  const totalPages = Math.ceil(allFilteredBlueprints.length / effectiveRecordsPerPage);
  const startIndex = (currentPage - 1) * effectiveRecordsPerPage;
  const endIndex = startIndex + effectiveRecordsPerPage;
  const filteredBlueprints = allFilteredBlueprints.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleStatusFilterChange = (filter: 'all' | 'published' | 'draft') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'recent' | 'oldest' | 'title');
    setCurrentPage(1);
  };

  const handleLevelsFilterChange = (value: string) => {
    setLevelsFilter(value);
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
      <Header showTokens tokenCount="932,679" />

      {/* Breadcrumb Navigation */}
      <div className="border-b bg-muted/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">Blueprints</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">All Blueprints</h1>
            <p className="text-muted-foreground">Manage and create course blueprints</p>
          </div>
          <Button 
            onClick={() => navigate("/create-blueprint")}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Create Blueprint
          </Button>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Total Blueprints */}
          <Card 
            onClick={() => handleStatusFilterChange('all')}
            className={`relative p-6 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 transition-all duration-300 cursor-pointer ${
              statusFilter === 'all' 
                ? 'border-t-4 border-t-primary shadow-lg opacity-100' 
                : 'border border-primary/50 hover:border-primary/70 opacity-85 hover:opacity-100'
            }`}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Total</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{totalBlueprints}</p>
                <p className="text-sm text-muted-foreground">Total Blueprints</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center border border-primary/20 shadow-sm">
                <Layers className="w-7 h-7 text-primary" />
              </div>
            </div>
          </Card>

          {/* Published */}
          <Card 
            onClick={() => handleStatusFilterChange('published')}
            className={`relative p-6 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 transition-all duration-300 cursor-pointer ${
              statusFilter === 'published' 
                ? 'border-t-4 border-t-green-600 dark:border-t-green-500 shadow-lg opacity-100' 
                : 'border border-green-500/50 hover:border-green-500/70 opacity-85 hover:opacity-100'
            }`}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-green-500/10" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Published</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{publishedCount}</p>
                <p className="text-sm text-muted-foreground">Published Blueprints</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center border border-green-500/20 shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Draft */}
          <Card 
            onClick={() => handleStatusFilterChange('draft')}
            className={`relative p-6 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 transition-all duration-300 cursor-pointer ${
              statusFilter === 'draft' 
                ? 'border-t-4 border-t-orange-600 dark:border-t-orange-500 shadow-lg opacity-100' 
                : 'border border-orange-500/50 hover:border-orange-500/70 opacity-85 hover:opacity-100'
            }`}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-500/10" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Draft</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{draftCount}</p>
                <p className="text-sm text-muted-foreground">Draft Blueprints</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center border border-orange-500/20 shadow-sm">
                <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                type="text"
                placeholder="Search blueprints by title..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              <TooltipProvider>
                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full sm:w-[160px]">
                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sort blueprints by date or title</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Hierarchy Levels Filter */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full sm:w-[160px]">
                      <Select value={levelsFilter} onValueChange={handleLevelsFilterChange}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {uniqueLevels.map(level => (
                            <SelectItem key={level} value={String(level)}>
                              {level} {level === 1 ? 'Level' : 'Levels'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter by number of hierarchy levels</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || levelsFilter !== 'all' || sortBy !== 'recent') && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {levelsFilter !== 'all' && (
                <Badge variant="secondary">
                  {levelsFilter} {Number(levelsFilter) === 1 ? 'Level' : 'Levels'}
                </Badge>
              )}
              {sortBy !== 'recent' && (
                <Badge variant="secondary">
                  {sortBy === 'oldest' ? 'Oldest First' : 'Title (A-Z)'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Blueprints Grid - Google Drive Style */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading blueprints...</span>
          </div>
        ) : filteredBlueprints.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Blueprints Found</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first blueprint</p>
            <Button onClick={() => navigate("/create-blueprint")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Blueprint
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBlueprints.map((blueprint) => (
              <Card 
                key={blueprint.Id}
                onClick={() => navigate(`/blueprint-editor/${blueprint.Id}`)}
                className="group overflow-hidden border-2 border-border hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900"
              >
                {/* Card Header with Icon and Menu */}
                <div className="p-4 pb-2 flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      {blueprint.Title}
                    </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        toast({
                          title: "Blueprint duplicated",
                          description: `"${blueprint.Title}" has been duplicated successfully.`,
                        });
                      }}
                    >
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Preview Area - Thumbnail */}
              <div className="mx-4 mb-4 aspect-[16/10] rounded-lg border border-border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden group-hover:border-primary/30 transition-colors">
                <div className="w-full h-full flex items-center justify-center p-6">
                  {/* Layout 1 Visual (default for all blueprints in list view) */}
                  <div className="w-full h-full flex flex-col gap-4">
                    {/* Image placeholder at top */}
                    <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                    {/* Two-column text sections */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Total Course Units Section */}
                <div className="mx-4 mb-3 p-4 rounded-lg border border-border bg-muted/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Hierarchy Levels</span>
                    <span className="text-xl font-bold text-foreground">{blueprint.NoOfLevels || 0}</span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="px-4 pb-4 flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        L
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{formatDate(blueprint.UpdatedDate)}</span>
                  </div>
                  {blueprint.BlueprintStatus === 1 ? (
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-0 text-xs px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20 border-0 text-xs px-2 py-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {allFilteredBlueprints.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-lg bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/20 mt-6">
            {/* Total Blueprints */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Total Blueprints:</span>
              <span className="text-sm font-semibold text-foreground">{allFilteredBlueprints.length}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Records Per Page:</span>
              <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                <SelectTrigger className="w-20 h-8 text-xs border-primary/30 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blueprints;
