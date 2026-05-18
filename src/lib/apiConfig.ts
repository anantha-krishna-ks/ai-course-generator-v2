/**
 * Centralized API configuration. All services should import API_BASE_URL from
 * here instead of hardcoding the host, so the deployment URL lives in a single
 * place and can be swapped via VITE_API_BASE_URL per environment.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://seab-testing.excelindia.com/contentv3api";

export const apiUrl = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};
