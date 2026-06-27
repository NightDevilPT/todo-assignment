export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;          // Optional fields (validation list, database errors, etc.)
}

export interface ApiMeta {
  success: boolean;
  statusCode: HttpStatus;
  message?: string;
  timestamp: string;      // ISO format string of the request completion
  startTime: number;      // Unix timestamp (ms) when request started
  endTime: number;        // Unix timestamp (ms) when request finished
  executionTimeMs: number; // Diff between endTime and startTime in milliseconds
  path?: string;          // Request endpoint path
}

export interface ApiPagination {
  page: number;          // Current page number (1-indexed)
  limit: number;         // Number of items per page
  totalItems: number;    // Total count of records matching query in DB
  totalPages: number;    // Total pages calculated (ceil(totalItems / limit))
  hasNextPage: boolean;  // True if there is a subsequent page
  hasPrevPage: boolean;  // True if there is a preceding page
}

export interface ApiResponse<T> {
  meta: ApiMeta;
  data: T | null;        // Holds payload on success, null on error
  error?: ApiError;      // Only present if meta.success is false
  pagination?: ApiPagination; // Only present if the endpoint is paginated (returns array lists)
}
