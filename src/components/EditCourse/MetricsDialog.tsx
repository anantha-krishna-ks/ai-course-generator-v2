import { Check, X, BookOpen, Layers, List, ListTree } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  tokensConsumed: number;
  chapters: any[];
}

interface MetricRow {
  chapter: string;
  module?: string;
  topic?: string;
  subTopic?: string;
  learningOutcome?: string;
  content: boolean;
  image: boolean;
  questions: boolean;
}

const StatusIcon = ({ status }: { status: boolean }) => (
  status ? (
    <Check className="w-5 h-5 text-green-600" />
  ) : (
    <X className="w-5 h-5 text-red-500" />
  )
);

export const MetricsDialog = ({
  open,
  onOpenChange,
  courseName,
  tokensConsumed,
  chapters,
}: MetricsDialogProps) => {
  // Transform chapters data into metrics rows
  const metricsData: MetricRow[] = [];
  
  chapters.forEach((chapter) => {
    // Chapter level
    metricsData.push({
      chapter: chapter.Title || "",
      content: !!chapter.Description,
      image: !!chapter.ImagePath,
      questions: !!(chapter.Questions && chapter.Questions.length > 0),
    });

    // Module level (if exists)
    if (chapter.CourseChapters && chapter.CourseChapters.length > 0) {
      chapter.CourseChapters.forEach((module: any) => {
        metricsData.push({
          chapter: chapter.Title || "",
          module: module.Title || "",
          content: !!module.Description,
          image: !!module.ImagePath,
          questions: !!(module.Questions && module.Questions.length > 0),
        });

        // Topic level (if exists)
        if (module.CourseChapters && module.CourseChapters.length > 0) {
          module.CourseChapters.forEach((topic: any) => {
            metricsData.push({
              chapter: chapter.Title || "",
              module: module.Title || "",
              topic: topic.Title || "",
              content: !!topic.Description,
              image: !!topic.ImagePath,
              questions: !!(topic.Questions && topic.Questions.length > 0),
            });

            // SubTopic level (if exists)
            if (topic.CourseChapters && topic.CourseChapters.length > 0) {
              topic.CourseChapters.forEach((subTopic: any) => {
                metricsData.push({
                  chapter: chapter.Title || "",
                  module: module.Title || "",
                  topic: topic.Title || "",
                  subTopic: subTopic.Title || "",
                  content: !!subTopic.Description,
                  image: !!subTopic.ImagePath,
                  questions: !!(subTopic.Questions && subTopic.Questions.length > 0),
                });
              });
            }
          });
        }
      });
    }
  });

  // Calculate completion statistics
  const totalItems = metricsData.length;
  const contentComplete = metricsData.filter(m => m.content).length;
  const imageComplete = metricsData.filter(m => m.image).length;
  const questionsComplete = metricsData.filter(m => m.questions).length;

  // Calculate counts
  const chapterCount = chapters.length;
  const moduleCount = chapters.reduce((acc, ch) => acc + (ch.CourseChapters?.length || 0), 0);
  const topicCount = chapters.reduce((acc, ch) => 
    acc + (ch.CourseChapters?.reduce((a: number, m: any) => a + (m.CourseChapters?.length || 0), 0) || 0), 0);
  const subTopicCount = chapters.reduce((acc, ch) => 
    acc + (ch.CourseChapters?.reduce((a: number, m: any) => 
      a + (m.CourseChapters?.reduce((b: number, t: any) => b + (t.CourseChapters?.length || 0), 0) || 0), 0) || 0), 0);

  // Calculate issues (items missing content/image/questions)
  const contentIssues = totalItems - contentComplete;
  const imageIssues = totalItems - imageComplete;
  const questionsIssues = totalItems - questionsComplete;

  // Filter to show only rows with errors
  const errorData = metricsData.filter(row => !row.content || !row.image || !row.questions);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-[95vw] max-h-[95vh] p-0 overflow-y-auto">
        {/* Fixed Header */}
        <div className="p-3 sm:p-4 pb-3 border-b sticky top-0 bg-background z-20">
          <div className="flex items-start justify-between gap-4">
            <DialogHeader className="pb-2 sm:pb-3 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-bold">Course Metrics Dashboard</DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>

          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Course Name</p>
                <p className="text-sm sm:text-base font-semibold break-words">{courseName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Tokens:</span>
                <Badge variant="destructive" className="text-xs sm:text-sm px-2 py-0.5">
                  {tokensConsumed.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content - Stats + Table */}
        <div className="px-3 sm:px-4">
          {/* Stats Widgets */}
          <div className="space-y-3 py-3">
            {/* Count Widgets */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">STRUCTURE OVERVIEW</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Chapters</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">{chapterCount}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                      <Layers className="w-4 h-4" />
                      <span>Modules</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{moduleCount}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                      <List className="w-4 h-4" />
                      <span>Topics</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-violet-600">{topicCount}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                      <ListTree className="w-4 h-4" />
                      <span>Sub-Topics</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{subTopicCount}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Separator */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-destructive/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs font-semibold text-destructive">ISSUES DETECTED</span>
              </div>
            </div>

            {/* Issue Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Missing Content</div>
                  <div className="text-3xl sm:text-4xl font-bold text-destructive">{contentIssues}<span className="text-lg text-muted-foreground">/{totalItems}</span></div>
                  <div className="mt-2 text-xs text-muted-foreground">Items without description</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Missing Images</div>
                  <div className="text-3xl sm:text-4xl font-bold text-orange-600">{imageIssues}<span className="text-lg text-muted-foreground">/{totalItems}</span></div>
                  <div className="mt-2 text-xs text-muted-foreground">Items without images</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Missing Questions</div>
                  <div className="text-3xl sm:text-4xl font-bold text-amber-600">{questionsIssues}<span className="text-lg text-muted-foreground">/{totalItems}</span></div>
                  <div className="mt-2 text-xs text-muted-foreground">Items without questions</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Table */}
          <div className="pb-3">
            <div className="rounded-lg border overflow-x-auto">
              <table className="min-w-[700px] sm:min-w-[900px] w-full">
                <thead className="bg-primary/15 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="text-left p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">Chapter</th>
                    <th className="text-left p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">Module</th>
                    <th className="text-left p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">Topic</th>
                    <th className="text-left p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">SubTopic</th>
                    <th className="text-left p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">Learning Outcome</th>
                    <th className="text-center p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r w-[60px]">Content</th>
                    <th className="text-center p-1.5 sm:p-2 font-semibold text-xs sm:text-sm border-r w-[60px]">Image</th>
                    <th className="text-center p-1.5 sm:p-2 font-semibold text-xs sm:text-sm w-[70px]">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {errorData.map((row, index) => {
                    const prevRow = index > 0 ? errorData[index - 1] : null;
                    
                    // Only show values if they're different from the previous row
                    const showChapter = !prevRow || prevRow.chapter !== row.chapter;
                    const showModule = !prevRow || prevRow.chapter !== row.chapter || prevRow.module !== row.module;
                    const showTopic = !prevRow || prevRow.module !== row.module || prevRow.topic !== row.topic;
                    const showSubTopic = !prevRow || prevRow.topic !== row.topic || prevRow.subTopic !== row.subTopic;
                    
                    return (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-background" : "bg-muted/20"} border-b border-border last:border-0`}
                      >
                        <td className="p-1.5 sm:p-2 text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">
                          <div className="line-clamp-2">{showChapter ? row.chapter : ""}</div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">
                          <div className="line-clamp-2">{showModule ? (row.module || "-") : ""}</div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">
                          <div className="line-clamp-2">{showTopic ? (row.topic || "-") : ""}</div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">
                          <div className="line-clamp-2">{showSubTopic ? (row.subTopic || "-") : ""}</div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-xs sm:text-sm border-r max-w-[100px] sm:max-w-[140px]">
                          <div className="line-clamp-2">{row.learningOutcome || "-"}</div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-center border-r w-[60px]">
                          <div className="flex justify-center">
                            <StatusIcon status={row.content} />
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-center border-r w-[60px]">
                          <div className="flex justify-center">
                            <StatusIcon status={row.image} />
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-center w-[70px]">
                          <div className="flex justify-center">
                            <StatusIcon status={row.questions} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-background border-t px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span>Yes</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                <span>No</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-muted-foreground">N/A</span>
                <span className="hidden sm:inline">Not Applicable</span>
              </div>
            </div>
            
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
