import { ApiResponse, HttpStatus, ErrorCode } from "@/interfaces/api.interface";

// Endpoint Enums: Centralized API route definitions
export enum ApiEndpoints {
  SIGNUP = "/api/auth/signup",
  LOGIN = "/api/auth/login",
  LOGOUT = "/api/auth/logout",
  ME = "/api/auth/me",
  TASKS = "/api/tasks",
}

/**
 * ClientApiError: Custom error class to wrap backend formatted errors on the frontend.
 */
export class ClientApiError extends Error {
  public statusCode: HttpStatus;
  public errorCode: ErrorCode;
  public details?: any;

  constructor(statusCode: HttpStatus, errorCode: ErrorCode, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, ClientApiError.prototype);
  }
}

/**
 * Base fetch wrapper function: Performs HTTP call, sets default headers,
 * parses JSON, and asserts success states based on the backend API meta shape.
 */
async function request<T>(url: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(config.headers);
  if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const finalConfig: RequestInit = {
    ...config,
    headers,
  };

  try {
    const res = await fetch(url, finalConfig);
    const result: ApiResponse<T> = await res.json();

    if (!res.ok || !result.meta?.success) {
      const code = result.error?.code || ErrorCode.INTERNAL_ERROR;
      const message = result.error?.message || result.meta?.message || "An unexpected error occurred.";
      const details = result.error?.details;
      throw new ClientApiError(res.status, code, message, details);
    }

    return result;
  } catch (error) {
    if (error instanceof ClientApiError) {
      throw error;
    }
    throw new ClientApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Network request failed."
    );
  }
}

// Client API service object exposing standard REST verbs
export const apiService = {
  get: <T>(url: string, config?: RequestInit) => 
    request<T>(url, { ...config, method: "GET" }),

  post: <T>(url: string, body?: any, config?: RequestInit) =>
    request<T>(url, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: any, config?: RequestInit) =>
    request<T>(url, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: any, config?: RequestInit) =>
    request<T>(url, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, config?: RequestInit) => 
    request<T>(url, { ...config, method: "DELETE" }),
};
