import type { CourseCreateRequest, CourseCreateResponse } from "@/types/course";

class CourseApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = "CourseApiError";
  }
}

const getAuthToken = (): string => {
  const token = import.meta.env.VITE_API_AUTH_TOKEN || localStorage.getItem("api_token");
  if (!token) {
    throw new CourseApiError("API token not found. Please configure your API token.");
  }
  return token;
};

export const courseApi = {
  async createCourse(data: CourseCreateRequest): Promise<CourseCreateResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        "https://seab-testing.excelindia.com/contentv3api/api/course/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new CourseApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof CourseApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CourseApiError(error.message);
      }
      throw new CourseApiError("An unexpected error occurred while creating the course");
    }
  },

  async generateCourse(data: CourseCreateRequest): Promise<CourseCreateResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        "https://seab-testing.excelindia.com/contentv3api/api/course/generatecourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new CourseApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof CourseApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CourseApiError(error.message);
      }
      throw new CourseApiError("An unexpected error occurred while generating the course");
    }
  },

  async updateCourse(data: CourseCreateRequest): Promise<CourseCreateResponse> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        "https://seab-testing.excelindia.com/contentv3api/api/course/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new CourseApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof CourseApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CourseApiError(error.message);
      }
      throw new CourseApiError("An unexpected error occurred while updating the course");
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://seab-testing.excelindia.com/contentv3api/api/course/delete/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new CourseApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }
    } catch (error) {
      if (error instanceof CourseApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CourseApiError(error.message);
      }
      throw new CourseApiError("An unexpected error occurred while deleting the course");
    }
  },

  async getCourses(
    perPage: number,
    pageNumber: number,
    searchString: string = "-1",
    custId: string = "0"
  ): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://seab-testing.excelindia.com/contentv3api/api/course/getcourses/${perPage}/${pageNumber}/${searchString}/${custId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new CourseApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof CourseApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CourseApiError(error.message);
      }
      throw new CourseApiError("An unexpected error occurred while fetching courses");
    }
  },
};

export { CourseApiError };
