import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper, withRateLimit } from "@/middleware";
import { AppError } from "@/middleware/apiWrapper";
import { loginUser } from "@/lib/auth";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

export const POST = withApiWrapper(
  withRateLimit({ windowMs: 60 * 1000, max: 15 })( // Limit: 15 login attempts per IP per minute
    async (request: NextRequest) => {
      const handlerStartTime = Date.now();

      let body;
      try {
        body = await request.json();
      } catch {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          "Invalid request body. Expected JSON data."
        );
      }

      const { email, password } = body;

      if (!email || !password) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          "Email and password are required fields."
        );
      }

      const userAgent = request.headers.get("user-agent") || undefined;
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        (request as any).ip ||
        "127.0.0.1";

      const authResult = await loginUser(email, password, userAgent, ipAddress);

      // Construct output matching withApiWrapper response layout
      const response = NextResponse.json(
        {
          meta: {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Login successful.",
            timestamp: new Date().toISOString(),
            startTime: handlerStartTime,
            endTime: Date.now(),
            executionTimeMs: Date.now() - handlerStartTime,
            path: request.nextUrl.pathname,
          },
          data: {
            user: authResult.user,
          },
        },
        { status: HttpStatus.OK }
      );

      const isProduction = process.env.NODE_ENV === "production";

      // Set Secure HTTP-Only Cookies
      response.cookies.set("access_token", authResult.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 15 * 60, // 15 minutes
        path: "/",
      });

      response.cookies.set("refresh_token", authResult.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    }
  )
);
