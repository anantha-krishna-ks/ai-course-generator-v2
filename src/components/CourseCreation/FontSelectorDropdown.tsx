import { Type, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface FontOption {
  id: string;
  label: string;
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "default", label: "Default font", stack: "" },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "proximanova", label: "Proxima Nova", stack: "'Proxima Nova', 'Nunito Sans', system-ui, sans-serif" },
  { id: "inter", label: "Inter", stack: "'Inter', system-ui, sans-serif" },
  { id: "opensans", label: "Open Sans Clean", stack: "'Open Sans', system-ui, sans-serif" },
  { id: "roboto", label: "Roboto Balanced", stack: "'Roboto', system-ui, sans-serif" },
  { id: "lato", label: "Lato", stack: "'Lato', system-ui, sans-serif" },
];

export const DEFAULT_FONT_ID = "default";

export const getFontStack = (id: string): string | undefined => {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  if (!found || !found.stack) return undefined;
  return found.stack;
};

interface FontSelectorDropdownProps {
  value: string;
  onChange: (id: string) => void;
}

export const FontSelectorDropdown = ({ value, onChange }: FontSelectorDropdownProps) => {
  const current = FONT_OPTIONS.find((f) => f.id === value) ?? FONT_OPTIONS[0];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border"
              aria-label={`Change font (current: ${current.label})`}
            >
              <Type className="w-4 h-4" aria-hidden="true" focusable="false" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change font ({current.label})</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Course font</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FONT_OPTIONS.map((font) => {
          const isActive = font.id === value;
          return (
            <DropdownMenuItem
              key={font.id}
              onClick={() => onChange(font.id)}
              className="cursor-pointer flex items-center justify-between gap-2"
              style={{ fontFamily: font.stack }}
            >
              <span className="text-sm">{font.label}</span>
              {isActive && <Check className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
