import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * NOTE: Client-side route protection is UX-only. Real authorization is enforced
 * by the API via Bearer token validation. This guard performs lightweight
 * format/expiration checks to prevent trivial bypass via arbitrary localStorage
 * values, then redirects unauthenticated users to /auth.
 */
const isValidToken = (token: string | null): boolean => {
  if (!token) return false;

  // Allow demo tokens used for local/preview flows
  if (token.startsWith("demo_token_")) return true;

  // JWT format validation: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload && typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("api_token");

  if (!isValidToken(token)) {
    // Clear any invalid token so stale state doesn't linger
    if (token) localStorage.removeItem("api_token");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
