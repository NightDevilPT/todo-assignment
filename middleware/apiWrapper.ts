import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, HttpStatus, ErrorCode, ApiError, ApiMeta } from "@/interfaces/api.interface";

/**
 * Custom AppError class used to handle operational API errors.
 * Throwing this error inside handlers wrapped with `withApiWrapper`
 * will automatically format the response with the provided status code and error code.
 */
export class AppError extends Error {
  public statusCode: HttpStatus;
  public errorCode: ErrorCode;
  public details?: any;

  constructor(statusCode: HttpStatus, errorCode: ErrorCode, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Definition of handler return shape, supporting custom data wrapper or raw outputs
export type HandlerResult<T = any> =
  | {
      data: T;
      message?: string;
      status?: HttpStatus;
      pagination?: any;
    }
  | T;

// Next.js Route Handler type
export type RouteHandler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse | HandlerResult> | NextResponse | HandlerResult;

/**
 * API Wrapper Middleware: Handles time-benchmarking, formats successful responses, 
 * catches thrown exceptions, and formats standardized error outputs.
 */
export function withApiWrapper(handler: RouteHandler) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const path = request.nextUrl.pathname;

    try {
      const result = await handler(request, context);

      // If the handler returned a raw NextResponse directly, return it as-is
      if (result instanceof NextResponse) {
        return result;
      }

      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;

      let responseData: any = null;
      let responseMessage: string | undefined = undefined;
      let responseStatus: HttpStatus = HttpStatus.OK;
      let responsePagination: any = undefined;

      // Extract details if wrapper structure was returned
      if (result && typeof result === "object" && "data" in result) {
        const typedResult = result as {
          data: any;
          message?: string;
          status?: HttpStatus;
          pagination?: any;
        };
        responseData = typedResult.data;
        responseMessage = typedResult.message;
        responseStatus = typedResult.status ?? HttpStatus.OK;
        responsePagination = typedResult.pagination;
      } else {
        responseData = result;
      }

      const meta: ApiMeta = {
        success: true,
        statusCode: responseStatus,
        message: responseMessage ?? "Success",
        timestamp: new Date().toISOString(),
        startTime,
        endTime,
        executionTimeMs,
        path,
      };

      const apiResponse: ApiResponse<any> = {
        meta,
        data: responseData,
        pagination: responsePagination,
      };

      return NextResponse.json(apiResponse, { status: responseStatus });
    } catch (error: any) {
      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;

      let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR;
      let message = "An internal server error occurred.";
      let details: any = undefined;

      if (error instanceof AppError) {
        statusCode = error.statusCode;
        errorCode = error.errorCode;
        message = error.message;
        details = error.details;
      } else if (error instanceof Error) {
        message = error.message;
        // Handle common Prisma or DB client duplicate key errors
        if (error.name === "PrismaClientKnownRequestError") {
          statusCode = HttpStatus.CONFLICT;
          errorCode = ErrorCode.CONFLICT;
        }
      }

      const meta: ApiMeta = {
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        startTime,
        endTime,
        executionTimeMs,
        path,
      };

      const apiResponse: ApiResponse<null> = {
        meta,
        data: null,
        error: {
          code: errorCode,
          message,
          details,
        },
      };

      return NextResponse.json(apiResponse, { status: statusCode });
    }
  };
}
