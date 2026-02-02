import { useMemo } from "react";
import { X, BarChart3, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

interface TokenVersion {
  id: number;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  editedAt: Date;
}

interface TokenConsumptionDialogProps {
  open: boolean;
  onClose: () => void;
  imageVersionHistory: TokenVersion[];
}

export function TokenConsumptionDialog({ open, onClose, imageVersionHistory }: TokenConsumptionDialogProps) {
  const totalInputTokens = useMemo(() => 
    imageVersionHistory.reduce((sum, v) => sum + v.inputTokens, 0) + 17716,
    [imageVersionHistory]
  );
  
  const totalOutputTokens = useMemo(() => 
    imageVersionHistory.reduce((sum, v) => sum + v.outputTokens, 0) + 22728,
    [imageVersionHistory]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[80vw] max-w-7xl h-auto max-h-[90vh] p-0 gap-0 [&>button]:hidden">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex-1 min-w-0 mr-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl truncate">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Token Consumption Details</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs sm:text-sm truncate">
                Overview of tokens used for this course generation
              </DialogDescription>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-background">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Input Token Card */}
                <Card className="relative overflow-hidden border hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <CardContent className="pt-4 sm:pt-5 pb-3 sm:pb-4 px-3 sm:px-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Input Token</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate">Tokens sent to AI</p>
                        </div>
                      </div>
                      <div className="text-center py-1 sm:py-2">
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {totalInputTokens.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Token Card */}
                <Card className="relative overflow-hidden border hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardContent className="pt-4 sm:pt-5 pb-3 sm:pb-4 px-3 sm:px-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Output Token</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate">Tokens generated by AI</p>
                        </div>
                      </div>
                      <div className="text-center py-1 sm:py-2">
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {totalOutputTokens.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Operations Table */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Operation History</h3>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total Operations: {imageVersionHistory.length}
                  </div>
                </div>
                <Card>
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <Table>
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">Operation</th>
                            <th className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold whitespace-nowrap">Input</th>
                            <th className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold whitespace-nowrap">Output</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold whitespace-nowrap">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {imageVersionHistory.map((version) => (
                            <tr key={version.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm min-w-[200px] sm:min-w-[300px] break-words">
                                {version.operation}
                              </td>
                              <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-medium whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                  {version.inputTokens.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-medium whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                  {version.outputTokens.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-muted-foreground whitespace-nowrap">
                                <span className="hidden sm:inline">
                                  {version.editedAt.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="sm:hidden">
                                  {version.editedAt.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
