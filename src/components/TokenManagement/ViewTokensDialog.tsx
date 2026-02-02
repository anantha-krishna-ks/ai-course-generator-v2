import { X, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CourseTokenData {
  courseName: string;
  inputTokens: number;
  outputTokens: number;
  consumedTokens: number;
  lastUpdated: string;
}

interface ViewTokensDialogProps {
  open: boolean;
  onClose: () => void;
}

// Mock data - matches the image provided
const mockCourseData: CourseTokenData[] = [
  { courseName: "About Diwali Festival", inputTokens: 9017, outputTokens: 6335, consumedTokens: 15352, lastUpdated: "22-Oct-2025" },
  { courseName: "About Dussara Festival", inputTokens: 3253, outputTokens: 3172, consumedTokens: 6425, lastUpdated: "21-Oct-2025" },
  { courseName: "About Dussara Festival1", inputTokens: 2313, outputTokens: 2099, consumedTokens: 4412, lastUpdated: "21-Oct-2025" },
  { courseName: "AI", inputTokens: 769, outputTokens: 760, consumedTokens: 1529, lastUpdated: "29-Oct-2025" },
  { courseName: "AI-30102025", inputTokens: 4958, outputTokens: 1973, consumedTokens: 6931, lastUpdated: "30-Oct-2025" },
  { courseName: "AI-30102025", inputTokens: 773, outputTokens: 819, consumedTokens: 1592, lastUpdated: "30-Oct-2025" },
  { courseName: "AI-301020251", inputTokens: 11725, outputTokens: 2182, consumedTokens: 13907, lastUpdated: "31-Oct-2025" },
  { courseName: "AI-31102025", inputTokens: 1688, outputTokens: 961, consumedTokens: 2649, lastUpdated: "30-Oct-2025" },
  { courseName: "Anatomy 11", inputTokens: 5457, outputTokens: 5394, consumedTokens: 10851, lastUpdated: "28-Oct-2025" },
  { courseName: "Avacoda test", inputTokens: 4662, outputTokens: 2283, consumedTokens: 6945, lastUpdated: "27-Oct-2025" },
  { courseName: "Botany-001", inputTokens: 5482, outputTokens: 4230, consumedTokens: 9712, lastUpdated: "27-Oct-2025" },
];

export function ViewTokensDialog({ open, onClose }: ViewTokensDialogProps) {
  const totalCarriedForward = 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[80vw] max-w-7xl h-[90vh] max-h-[90vh] p-0 gap-0 [&>button]:hidden overflow-hidden">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex-1 min-w-0 mr-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl truncate">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Tokens Usage</span>
              </DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-primary/10 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <DialogDescription className="sr-only">View tokens usage overview and per-course breakdown.</DialogDescription>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4 md:px-6 md:py-4 bg-background">
            <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-6 min-w-0">
              {/* Renewed On and Tokens Carried Forward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Renewed On</span>
                    </div>
                    <span className="text-base sm:text-lg font-semibold whitespace-nowrap">01 Jan 1</span>
                  </div>
                </Card>

                <Card className="p-3 sm:p-4 bg-muted/30 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Tokens carried forward from previous allotment</span>
                    <span className="text-base sm:text-lg font-semibold whitespace-nowrap">0</span>
                  </div>
                </Card>
              </div>

              {/* Usage Overview */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Usage Overview</h3>
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground whitespace-nowrap">0.0% Used</span>
                </div>

                {/* Token Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {/* Total Tokens Card */}
                  <Card className="relative overflow-hidden border-2 border-blue-200">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">TOTAL TOKENS</p>
                        <p className="text-2xl sm:text-3xl font-bold">0</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-xs text-blue-600 font-medium">Allocated</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Available Tokens Card */}
                  <Card className="relative overflow-hidden border-2 border-green-200">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">AVAILABLE TOKENS</p>
                        <p className="text-2xl sm:text-3xl font-bold">0</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-xs text-green-600 font-medium">Ready to use</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Consumed Tokens Card */}
                  <Card className="relative overflow-hidden border-2 border-orange-200">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">CONSUMED TOKENS</p>
                        <p className="text-2xl sm:text-3xl font-bold">0</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="text-xs text-orange-600 font-medium">Used</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Course Tokens Table */}
              {/* Mobile list view */}
              <Card className="md:hidden w-full min-w-0 overflow-hidden">
                <div className="divide-y">
                  {mockCourseData.map((course, index) => (
                    <div key={index} className="p-3 sm:p-4">
                      <div className="text-sm font-semibold">{course.courseName}</div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div className="text-muted-foreground">Input</div>
                        <div className="text-right font-medium">{course.inputTokens.toLocaleString()}</div>
                        <div className="text-muted-foreground">Output</div>
                        <div className="text-right font-medium">{course.outputTokens.toLocaleString()}</div>
                        <div className="text-muted-foreground">Consumed</div>
                        <div className="text-right font-medium">{course.consumedTokens.toLocaleString()}</div>
                        <div className="text-muted-foreground">Updated</div>
                        <div className="text-right">{course.lastUpdated}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Desktop/tablet table view */}
              <Card className="hidden md:block w-full min-w-0 overflow-hidden">
                <div className="w-full max-w-full overflow-x-auto">
                  <div className="inline-block min-w-[640px] sm:min-w-full align-middle">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs md:text-sm font-semibold min-w-[150px]">Course Name</TableHead>
                          <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">Input</TableHead>
                          <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">Output</TableHead>
                          <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">Consumed</TableHead>
                          <TableHead className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCourseData.map((course, index) => (
                          <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-medium max-w-[200px] truncate">
                              {course.courseName}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                              {course.inputTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                              {course.outputTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                              {course.consumedTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-center text-muted-foreground whitespace-nowrap">
                              {course.lastUpdated}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
