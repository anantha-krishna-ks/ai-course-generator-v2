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
  iconWrapClass: string;
  iconClass: string;
  primary: { label: string; action: "home" | "back" | "retry"; icon: LucideIcon };
  secondary?: { label: string; action: "home" | "back" | "retry"; icon: LucideIcon };
  /** tailwind animation utility for the illustration */
  animation: string;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  "404": {
    code: "404",
    title: "Page not found",
    description:
      "The page you’re looking for doesn’t exist or may have been moved. Check the URL or head back home.",
    Icon: FileQuestion,
    iconWrapClass: "bg-primary/10 ring-primary/20",
    iconClass: "text-primary",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
    animation: "animate-[float_3s_ease-in-out_infinite]",
  },
  "500": {
    code: "500",
    title: "Something went wrong",
    description:
      "Our server hit an unexpected snag. We’ve been notified — please try again in a moment.",
    Icon: ServerCrash,
    iconWrapClass: "bg-destructive/10 ring-destructive/20",
    iconClass: "text-destructive",
    primary: { label: "Try Again", action: "retry", icon: RefreshCw },
    secondary: { label: "Go to Home", action: "home", icon: Home },
    animation: "animate-[wiggle_1.2s_ease-in-out_infinite]",
  },
  "403": {
    code: "403",
    title: "Access forbidden",
    description:
      "You don’t have permission to view this page. If you believe this is a mistake, contact your administrator.",
    Icon: ShieldAlert,
    iconWrapClass: "bg-warning/10 ring-warning/20",
    iconClass: "text-warning",
    primary: { label: "Go to Home", action: "home", icon: Home },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
    animation: "animate-[float_3s_ease-in-out_infinite]",
  },
  "401": {
    code: "401",
    title: "Authentication required",
    description:
      "You need to be signed in to access this page. Please log in to continue.",
    Icon: Lock,
    iconWrapClass: "bg-info/10 ring-info/20",
    iconClass: "text-info",
    primary: { label: "Sign In", action: "home", icon: Lock },
    secondary: { label: "Go Back", action: "back", icon: ArrowLeft },
    animation: "animate-[pulseGlow_2s_ease-in-out_infinite]",
  },
  maintenance: {
    code: "503",
    title: "We’ll be right back",
    description:
      "We’re performing scheduled maintenance to improve your experience. Please check back shortly.",
    Icon: Wrench,
    iconWrapClass: "bg-warning/10 ring-warning/20",
    iconClass: "text-warning",
    primary: { label: "Refresh", action: "retry", icon: RefreshCw },
    animation: "animate-[wrenchSpin_3s_ease-in-out_infinite]",
  },
  network: {
    code: "Offline",
    title: "Connection lost",
    description:
      "We can’t reach the server. Check your internet connection and try again.",
    Icon: WifiOff,
    iconWrapClass: "bg-muted ring-border",
    iconClass: "text-muted-foreground",
    primary: { label: "Retry", action: "retry", icon: RefreshCw },
    secondary: { label: "Go to Home", action: "home", icon: Home },
    animation: "animate-[fadePulse_1.8s_ease-in-out_infinite]",
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
      // Helpful diagnostic for genuine 404s
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
      role="main"
      className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 overflow-hidden"
    >
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-glow/10 blur-3xl" />
      </div>

      <section
        className="relative w-full max-w-xl mx-auto text-center animate-fade-in"
        aria-labelledby="error-title"
      >
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div
            className={cn(
              "relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-1 ring-inset",
              config.iconWrapClass,
            )}
          >
            <Icon
              className={cn("w-14 h-14 sm:w-16 sm:h-16", config.iconClass, config.animation)}
              aria-hidden="true"
              focusable="false"
            />
          </div>
        </div>

        {/* Code badge */}
        <div className="mb-3">
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Error · {config.code}
          </span>
        </div>

        <h1
          id="error-title"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight"
        >
          {config.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
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

        {/* Footer help text */}
        <p className="mt-10 text-xs text-muted-foreground">
          Still having trouble?{" "}
          <a
            href="mailto:support@example.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            Contact support
          </a>
        </p>
      </section>
    </main>
  );
};

export default ErrorPage;
