import { BlueprintCreateRequest, BlueprintCreateResponse, BlueprintListResponse } from "@/types/blueprint";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://seab-testing.excelindia.com/contentv3api";

export class BlueprintApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "BlueprintApiError";
  }
}

/**
 * Get authentication token from environment or localStorage
 */
function getAuthToken(): string | null {
  // Try environment variable first
  const envToken = import.meta.env.VITE_API_AUTH_TOKEN;
  if (envToken) return envToken;
  
  // Fallback to localStorage
  return localStorage.getItem('api_token');
}

export const blueprintApi = {
  /**
   * Create a new blueprint
   */
  async createBlueprint(data: BlueprintCreateRequest): Promise<BlueprintCreateResponse> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token is available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/blueprint/createblueprint`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Provide specific error messages for common status codes
        let errorMessage = errorData.message || `Failed to create blueprint: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = "Unauthorized: Please configure your API token";
        } else if (response.status === 403) {
          errorMessage = "Forbidden: You don't have permission to create blueprints";
        } else if (response.status === 400) {
          errorMessage = errorData.message || "Invalid request: Please check your input data";
        }
        
        throw new BlueprintApiError(
          errorMessage,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof BlueprintApiError) {
        throw error;
      }
      throw new BlueprintApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  },

  /**
   * Get blueprint by ID
   */
  async getBlueprintById(id: string): Promise<BlueprintCreateResponse> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/blueprint/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorMessage = response.status === 401
          ? "Unauthorized: Please configure your API token"
          : `Failed to fetch blueprint: ${response.statusText}`;
          
        throw new BlueprintApiError(
          errorMessage,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof BlueprintApiError) {
        throw error;
      }
      throw new BlueprintApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  },

  /**
   * Get list of blueprints
   * @param pageSize Number of items per page
   * @param pageNumber Current page number (1-indexed)
   * @param filter Filter parameter (-1 for all)
   */
  async getBlueprints(pageSize: number = 10, pageNumber: number = 1, filter: number = -1): Promise<BlueprintListResponse> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/blueprint/getblueprints/${pageSize}/${pageNumber}/${filter}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorMessage = response.status === 401
          ? "Unauthorized: Please log in to view blueprints"
          : `Failed to fetch blueprints: ${response.statusText}`;
          
        throw new BlueprintApiError(
          errorMessage,
          response.status
        );
      }

      const data = await response.json();
      
      // Check API response status
      if (data.Status !== 0) {
        throw new BlueprintApiError(
          data.Message || "Failed to fetch blueprints",
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BlueprintApiError) {
        throw error;
      }
      throw new BlueprintApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  },

  /**
   * Clone an existing blueprint
   * @param blueprintId ID of the blueprint to clone
   * @param newTitle Title for the cloned blueprint
   */
  async cloneBlueprint(blueprintId: string, newTitle: string): Promise<BlueprintCreateResponse> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/blueprint/clone/${blueprintId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        let errorMessage = errorData.message || `Failed to clone blueprint: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = "Unauthorized: Please configure your API token";
        } else if (response.status === 403) {
          errorMessage = "Forbidden: You don't have permission to clone blueprints";
        } else if (response.status === 404) {
          errorMessage = "Blueprint not found";
        }
        
        throw new BlueprintApiError(
          errorMessage,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof BlueprintApiError) {
        throw error;
      }
      throw new BlueprintApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  },
};
