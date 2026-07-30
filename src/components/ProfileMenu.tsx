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
import { LogOut, KeyRound, Shield } from "lucide-react";
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
        <DropdownMenuContent align="end" className="w-48 bg-card">
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
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}

export default ProfileMenu;
