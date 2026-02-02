import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, KeyRound, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import excelsoftLogo from "@/assets/courseed-logo.png";
import { brandingService, BrandingSettings } from "@/services/brandingService";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

interface HeaderProps {
  showTokens?: boolean;
  onTokenClick?: () => void;
  tokenCount?: string;
}

const Header = ({ showTokens = false, onTokenClick, tokenCount = "932,679" }: HeaderProps) => {
  const navigate = useNavigate();
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    // Load initial branding
    setBranding(brandingService.getCurrentBranding());

    // Subscribe to changes
    const unsubscribe = brandingService.subscribe((newBranding) => {
      setBranding(newBranding);
    });

    return unsubscribe;
  }, []);

  // Determine which logos to show in header
  // Customer Logo Only: show only customer logo in header
  // Excelsoft Logo Only: show nothing in header (logo goes to footer)
  // Both Logos: show only customer logo in header (Excelsoft goes to footer)
  const showCustomerLogoInHeader = branding && (branding.brandingOption === "customer" || branding.brandingOption === "both") && branding.customerLogo;

  return (
    <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {showCustomerLogoInHeader && (
              <img src={branding.customerLogo} alt={branding.customerName} className="w-8 h-8 object-contain" />
            )}
            <h1 className="text-lg font-bold text-foreground hidden sm:block">AI Course Generator</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {showTokens && (
              <button 
                onClick={onTokenClick}
                className="hidden sm:flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-foreground">{tokenCount}</span>
                <span className="text-xs text-muted-foreground">tokens</span>
              </button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full w-11 h-11 p-0 hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/50 shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    A
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate("/admin-module")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Module
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => navigate("/auth")}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <ChangePasswordDialog 
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </header>
  );
};

export default Header;
