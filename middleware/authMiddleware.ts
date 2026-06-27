import { NextRequest, NextResponse } from "next/server";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { verifyAccessToken } from "@/lib/jwt";
import { refreshSession } from "@/lib/auth";
import { AppError, RouteHandler } from "./apiWrapper";

/**
 * Route Auth Middleware: Wraps Next.js route handlers to enforce authentication.
 * Checks for a valid Access Token, falls back to a valid Refresh Token (performing automatic rotation),
 * and injects client headers (`x-user-id` and `x-user-email`) into the request object.
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context: any) => {
    const startTime = Date.now();
    const path = request.nextUrl.pathname;

    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      (request as any).ip ||
      "127.0.0.1";

    // Extract Access and Refresh tokens from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    let userId: string | null = null;
    let userEmail: string | null = null;
    let newAccessToken: string | null = null;

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        userId = decoded.userId;
        userEmail = decoded.email;
      }
    }

    // If access token is invalid/expired, try to rotate using refresh token
    if (!userId) {
      if (!refreshToken) {
        throw new AppError(
          HttpStatus.UNAUTHORIZED,
          ErrorCode.UNAUTHORIZED,
          "Access denied. No active session token found. Please log in."
        );
      }

      try {
        // Refresh session using refresh token logic
        const refreshResult = await refreshSession(refreshToken, userAgent, ipAddress);
        userId = refreshResult.user.id;
        userEmail = refreshResult.user.email;
        newAccessToken = refreshResult.accessToken;
      } catch (error: any) {
        // Wrap database refresh errors as unauthorized
        throw new AppError(
          HttpStatus.UNAUTHORIZED,
          ErrorCode.UNAUTHORIZED,
          error.message || "Session expired. Please log in again."
        );
      }
    }

    if (!userId || !userEmail) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        "Access denied. User session is invalid."
      );
    }

    // Inject user details into the custom context object rather than mutating request headers
    const authenticatedContext = {
      ...context,
      user: {
        id: userId,
        email: userEmail,
      },
    };

    const result = await handler(request, authenticatedContext);

    // If token was rotated, intercept the response to write the new cookie
    if (newAccessToken) {
      let response: NextResponse;

      if (result instanceof NextResponse) {
        response = result;
      } else {
        // Replicate apiWrapper formatting so the success response schema remains consistent
        const endTime = Date.now();
        const executionTimeMs = endTime - startTime;

        let responseData: any = null;
        let responseMessage = "Success";
        let responseStatus = HttpStatus.OK;
        let responsePagination = undefined;

        if (result && typeof result === "object" && "data" in result) {
          const typedResult = result as {
            data: any;
            message?: string;
            status?: HttpStatus;
            pagination?: any;
          };
          responseData = typedResult.data;
          responseMessage = typedResult.message ?? "Success";
          responseStatus = typedResult.status ?? HttpStatus.OK;
          responsePagination = typedResult.pagination;
        } else {
          responseData = result;
        }

        response = NextResponse.json(
          {
            meta: {
              success: true,
              statusCode: responseStatus,
              message: responseMessage,
              timestamp: new Date().toISOString(),
              startTime,
              endTime,
              executionTimeMs,
              path,
            },
            data: responseData,
            pagination: responsePagination,
          },
          { status: responseStatus }
        );
      }

      // Attach new short-lived access token cookie
      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 minutes
        path: "/",
      });

      return response;
    }

    return result;
  };
}
