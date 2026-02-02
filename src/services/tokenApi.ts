const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://seab-testing.excelindia.com/contentv3api";

export interface TokenInfo {
  renewedOn: string;
  totalTokens: number;
  availableTokens: number;
  consumedTokens: number;
  carriedForward: number;
}

export class TokenApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "TokenApiError";
  }
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  const envToken = import.meta.env.VITE_API_AUTH_TOKEN;
  if (envToken) return envToken;
  
  return localStorage.getItem('api_token');
}

export const tokenApi = {
  /**
   * Get home token information
   */
  async getHomeTokenInfo(userId: string = "0"): Promise<TokenInfo> {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/token/gethometokeninfo/${userId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorMessage = response.status === 401
          ? "Unauthorized: Please log in to view token information"
          : `Failed to fetch token info: ${response.statusText}`;
          
        throw new TokenApiError(
          errorMessage,
          response.status
        );
      }

      const data = await response.json();
      
      // Check API response status
      if (data.Status !== 0) {
        throw new TokenApiError(
          data.Message || "Failed to fetch token information",
          response.status,
          data
        );
      }

      // Map API response to TokenInfo format
      const entity = data.Entity || {};
      return {
        renewedOn: entity.OpeningDate ? new Date(entity.OpeningDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : "N/A",
        totalTokens: (entity.OpeningBalance || 0) + (entity.NewTokens || 0),
        availableTokens: entity.AvailableTokens || 0,
        consumedTokens: entity.ConsumedTotkens || 0,
        carriedForward: entity.OpeningBalance || 0,
      };
    } catch (error) {
      if (error instanceof TokenApiError) {
        throw error;
      }
      throw new TokenApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  },
};
