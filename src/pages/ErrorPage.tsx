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
    title: "Oops! Page Not Found",
    description:
      "The page you’re looking for doesn’t exist or may have been moved. Let’s get you back on track.",
    Icon: FileQuestion,
    iconClass: "text-primary",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  "500": {
    code: "500",
    title: "Oops! Internal Server Error",
    description:
      "Internal Server Boo-Boo: Our bad! The server hiccuped. We’re dusting off the code and will have it sorted soon. Please be patient.",
    Icon: ServerCrash,
    iconClass: "text-destructive",
    primary: { label: "Be Patient, Try Again", action: "retry", icon: RefreshCw },
    secondary: { label: "Go to Home", action: "home", icon: Home },
  },
  "403": {
    code: "403",
    title: "Access Forbidden",
    description:
      "You don’t have permission to view this page. If you believe this is a mistake, please contact your administrator.",
    Icon: ShieldAlert,
    iconClass: "text-warning",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  "401": {
    code: "401",
    title: "Authentication Required",
    description:
      "You need to be signed in to access this page. Please log in to continue your journey.",
    Icon: Lock,
    iconClass: "text-info",
    primary: { label: "Sign In", action: "home", icon: Lock },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
  },
  maintenance: {
    code: "503",
    title: "We’ll Be Right Back",
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
      "We can’t reach the server right now. Check your internet connection and try again.",
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
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <section
        className="relative w-full max-w-xl mx-auto text-center animate-fade-in"
        aria-labelledby="error-title"
      >
        {/* Illustration */}
        <div className="flex justify-center mb-10">
          <div className="relative inline-flex flex-col items-center">
            <Icon
              className={cn("w-28 h-28 sm:w-32 sm:h-32", config.iconClass)}
              strokeWidth={1.25}
              aria-hidden="true"
              focusable="false"
            />
            {/* Soft ground shadow */}
            <span
              aria-hidden="true"
              className="mt-3 block h-2 w-24 sm:w-28 rounded-full bg-muted"
            />
          </div>
        </div>

        {/* Code */}
        <h1
          id="error-title"
          className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-foreground tracking-tight leading-none"
        >
          {config.code}
        </h1>

        {/* Title */}
        <p className="mt-8 text-xl sm:text-2xl font-bold text-foreground">
          {config.title}
        </p>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {config.description}
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={() => runAction(primary.action)}
            className="w-full sm:w-auto gap-2 px-8"
          >
            <PrimaryIcon className="w-4 h-4" aria-hidden="true" />
            {primary.label}
          </Button>
          {secondary && SecondaryIcon && (
            <Button
              size="lg"
              variant="ghost"
              onClick={() => runAction(secondary.action)}
              className="w-full sm:w-auto gap-2 px-8"
            >
              <SecondaryIcon className="w-4 h-4" aria-hidden="true" />
              {secondary.label}
            </Button>
          )}
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
