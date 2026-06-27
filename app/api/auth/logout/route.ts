import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper, withAuth } from "@/middleware";
import { revokeSession } from "@/lib/auth";
import { HttpStatus } from "@/interfaces/api.interface";
import { config } from "@/lib/config";

// POST /api/auth/logout: Revoke DB session and clear cookies
export const POST = withApiWrapper(
  withAuth(
    async (request: NextRequest) => {
      const handlerStartTime = Date.now();
      const refreshToken = request.cookies.get("refresh_token")?.value;

      if (refreshToken) {
        try {
          // Attempt to revoke the session in the database
          await revokeSession(refreshToken);
        } catch {
          // If token signature is invalid, proceed to clear cookies anyway
        }
      }

      // Replicate standard apiWrapper success layout for custom NextResponse return
      const response = NextResponse.json(
        {
          meta: {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Logged out successfully.",
            timestamp: new Date().toISOString(),
            startTime: handlerStartTime,
            endTime: Date.now(),
            executionTimeMs: Date.now() - handlerStartTime,
            path: request.nextUrl.pathname,
          },
          data: null,
        },
        { status: HttpStatus.OK }
      );

      // Invalidate cookies by setting empty values and maxAge to 0
      response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      response.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }
  )
);
