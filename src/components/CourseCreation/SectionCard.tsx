import { useState } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  onTitleChange: (title: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onOpenSection?: () => void;
  onAddPage?: () => void;
  onAddLearningObjective?: () => void;
}

const MAX_TITLE_LENGTH = 255;

export function SectionCard({
  sectionNumber,
  title,
  onTitleChange,
  onDelete,
  onDuplicate,
  onOpenSection,
  onAddPage,
  onAddLearningObjective,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-0">
      {/* Section Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Section {sectionNumber}
          </span>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-background border border-border">
                <DropdownMenuItem
                  onClick={onDuplicate}
                  className="cursor-pointer hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer text-destructive hover:!bg-muted focus:!bg-muted focus:!text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronUp className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                isCollapsed && "rotate-180"
              )} />
            </button>
          </div>
        </div>

        {/* Collapsible content area */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="flex gap-4">
                {/* Thumbnail placeholder */}
                <div className="w-[120px] h-[90px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                </div>

                {/* Title and actions */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_TITLE_LENGTH) {
                        onTitleChange(e.target.value);
                      }
                    }}
                    className="w-full text-lg font-medium text-foreground bg-transparent border-b border-border focus:border-foreground outline-none pb-1 placeholder:text-muted-foreground/50"
                    placeholder="Untitled section"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={onAddLearningObjective}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add learning objective
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenSection}
                      className="text-sm border-border"
                    >
                      Open section
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add page button inside card */}
            <div className="pl-4 pt-3 pb-4">
              <button
                onClick={onAddPage}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add page
              </button>
            </div>

            {/* Dashed divider */}
            <div className="border-b border-dashed border-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
