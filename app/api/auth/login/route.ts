import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper, withRateLimit } from "@/middleware";
import { AppError } from "@/middleware/apiWrapper";
import { loginUser } from "@/lib/auth";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { loginSchema } from "@/lib/user/validation";
import { config } from "@/lib/config";

export const POST = withApiWrapper(
  withRateLimit(config.rateLimits.login)(
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

      const validationResult = loginSchema.safeParse(body);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0]?.message || "Validation failed.";
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          firstError
        );
      }

      const { email, password } = validationResult.data;

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

      const isProduction = config.isProduction;
      const accessMaxAge = config.jwt.accessMaxAge;
      const refreshMaxAge = config.jwt.refreshMaxAge;

      // Set Secure HTTP-Only Cookies
      response.cookies.set("access_token", authResult.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: accessMaxAge,
        path: "/",
      });

      response.cookies.set("refresh_token", authResult.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: refreshMaxAge,
        path: "/",
      });

      return response;
    }
  )
);
