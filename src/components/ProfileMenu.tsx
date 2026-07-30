import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, KeyRound, Shield, Coins, ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

interface ProfileMenuProps {
  initial?: string;
  compact?: boolean;
}

export function ProfileMenu({ initial = "A", compact = false }: ProfileMenuProps) {
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={
              compact
                ? "rounded-full w-9 h-9 p-0 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 shadow-sm transition-all"
                : "rounded-full w-11 h-11 p-0 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 shadow-sm transition-all"
            }
            aria-label="User menu"
          >
            <div
              className={
                (compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm") +
                " rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-primary"
              }
              aria-hidden="true"
            >
              {initial}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[340px] p-0 overflow-hidden rounded-2xl border border-border/70 shadow-xl bg-card"
        >
          {/* Token usage header */}
          <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Coins className="w-4.5 h-4.5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Token Usage</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">This course</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold text-foreground tabular-nums leading-none">40,444</span>
                <span className="text-xs font-medium text-muted-foreground">tokens</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.6)]" />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>42% of monthly quota</span>
                <span className="tabular-nums">96,000 left</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="px-5 py-4 space-y-2.5 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <ArrowDownRight className="w-3.5 h-3.5 text-accent-foreground" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Input</p>
                  <p className="text-[10px] text-muted-foreground">Prompts &amp; context</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">17,716</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Output</p>
                  <p className="text-[10px] text-muted-foreground">Generated content</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">22,728</span>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border/60 bg-muted/30 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <TrendingUp className="w-3 h-3" aria-hidden="true" focusable="false" />
            <span>Updated just now</span>
          </div>

          <div className="p-1.5 border-t border-border/60">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setChangePasswordOpen(true)}>
            <KeyRound className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin-module")}>
            <Shield className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
            Admin Module
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => navigate("/auth")}
          >
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
            Logout
          </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}

export default ProfileMenu;
