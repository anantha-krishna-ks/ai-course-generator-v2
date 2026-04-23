import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FileQuestion,
  ServerCrash,
  ShieldAlert,
  Lock,
  Wrench,
  WifiOff,
  ArrowLeft,
  Home,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorType = "404" | "500" | "403" | "401" | "maintenance" | "network";

interface ErrorConfig {
  code: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  iconClass: string;
  primary: { label: string; action: "home" | "back" | "retry"; icon: LucideIcon };
  secondary?: { label: string; action: "home" | "back" | "retry"; icon: LucideIcon };
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  "404": {
    code: "404",
    title: "Page Not Found",
    description:
      "The page you’re looking for doesn’t exist or may have been moved. Check the URL or head back home.",
    Icon: FileQuestion,
    iconClass: "text-primary",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  "500": {
    code: "500",
    title: "Internal Server Error",
    description:
      "Our server hit an unexpected snag. We’ve been notified — please try again in a moment.",
    Icon: ServerCrash,
    iconClass: "text-destructive",
    primary: { label: "Try Again", action: "retry", icon: RefreshCw },
    secondary: { label: "Go to Home", action: "home", icon: Home },
  },
  "403": {
    code: "403",
    title: "Access Forbidden",
    description:
      "You don’t have permission to view this page. If you believe this is a mistake, contact your administrator.",
    Icon: ShieldAlert,
    iconClass: "text-warning",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  "401": {
    code: "401",
    title: "Authentication Required",
    description:
      "You need to be signed in to access this page. Please log in to continue.",
    Icon: Lock,
    iconClass: "text-info",
    primary: { label: "Sign In", action: "home", icon: Lock },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  maintenance: {
    code: "503",
    title: "Under Maintenance",
    description:
      "We’re performing scheduled maintenance to improve your experience. Please check back shortly.",
    Icon: Wrench,
    iconClass: "text-warning",
    primary: { label: "Refresh", action: "retry", icon: RefreshCw },
  },
  network: {
    code: "Offline",
    title: "Connection Lost",
    description:
      "We can’t reach the server. Check your internet connection and try again.",
    Icon: WifiOff,
    iconClass: "text-muted-foreground",
    primary: { label: "Retry", action: "retry", icon: RefreshCw },
    secondary: { label: "Go to Home", action: "home", icon: Home },
  },
};

interface ErrorPageProps {
  /** Override the error type detected from the route. */
  type?: ErrorType;
}

const resolveType = (raw?: string): ErrorType => {
  if (!raw) return "404";
  const v = raw.toLowerCase();
  if (v in ERROR_CONFIGS) return v as ErrorType;
  return "404";
};

const ErrorPage = ({ type: typeProp }: ErrorPageProps) => {
  const params = useParams<{ type?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const type: ErrorType = typeProp ?? resolveType(params.type);
  const config = useMemo(() => ERROR_CONFIGS[type], [type]);

  useEffect(() => {
    if (type === "404") {
      // eslint-disable-next-line no-console
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [type, location.pathname]);

  const runAction = (action: "home" | "back" | "retry") => {
    if (action === "home") navigate("/");
    else if (action === "back") {
      if (window.history.length > 1) navigate(-1);
      else navigate("/");
    } else if (action === "retry") {
      window.location.reload();
    }
  };

  const { Icon, primary, secondary } = config;
  const PrimaryIcon = primary.icon;
  const SecondaryIcon = secondary?.icon;

  return (
    <main
      className="relative min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12"
    >
      <section
        className="relative w-full max-w-3xl mx-auto animate-fade-in"
        aria-labelledby="error-title"
      >
        {/* Browser window card */}
        <div className="rounded-2xl bg-card shadow-xl border border-border overflow-hidden">
          {/* Browser top bar */}
          <div className="bg-primary px-4 py-3 flex items-center gap-2">
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-primary-foreground/70" />
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-primary-foreground/70" />
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-primary-foreground/70" />
          </div>

          {/* Card body */}
          <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center">
            <div
              aria-hidden="true"
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 opacity-90"
            >
              <Icon
                className={cn("w-20 h-20 sm:w-28 sm:h-28", config.iconClass)}
                strokeWidth={1.5}
              />
            </div>

            <h1
              id="error-title"
              className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-foreground tracking-tight leading-none"
            >
              {config.code}
            </h1>

            <p className="mt-6 text-xl sm:text-2xl font-semibold text-foreground">
              {config.title}
            </p>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              {config.description}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => runAction(primary.action)}
                className="w-full sm:w-auto gap-2"
              >
                <PrimaryIcon className="w-4 h-4" aria-hidden="true" />
                {primary.label}
              </Button>
              {secondary && SecondaryIcon && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => runAction(secondary.action)}
                  className="w-full sm:w-auto gap-2"
                >
                  <SecondaryIcon className="w-4 h-4" aria-hidden="true" />
                  {secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
