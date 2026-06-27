import { NextRequest } from "next/server";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { AppError, RouteHandler } from "./apiWrapper";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory rate limiting store (IP:path -> store)
const memoryStore = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  windowMs: number; // Duration of window in milliseconds
  max: number;      // Maximum requests allowed per window
}

/**
 * Rate Limiter Middleware: Validates client IP and limits access to endpoints.
 * Throws a `TOO_MANY_REQUESTS` AppError when thresholds are crossed.
 */
export function withRateLimit(config: RateLimitConfig) {
  return (handler: RouteHandler): RouteHandler => {
    return async (request: NextRequest, context: any) => {
      // Fetch the requesting IP Address
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        (request as any).ip ||
        "127.0.0.1";

      const key = `${ip}:${request.nextUrl.pathname}`;
      const now = Date.now();

      let clientRecord = memoryStore.get(key);

      if (!clientRecord) {
        // First request from this IP
        clientRecord = {
          count: 1,
          resetTime: now + config.windowMs,
        };
        memoryStore.set(key, clientRecord);
      } else {
        if (now > clientRecord.resetTime) {
          // If window expired, reset client count and window reset time
          clientRecord.count = 1;
          clientRecord.resetTime = now + config.windowMs;
        } else {
          // Inside existing window frame, increment request count
          clientRecord.count += 1;
        }
      }

      // Check if limit is exceeded
      if (clientRecord.count > config.max) {
        const retryAfterSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);
        throw new AppError(
          HttpStatus.TOO_MANY_REQUESTS,
          ErrorCode.RATE_LIMIT_EXCEEDED,
          `Too many requests. Please try again after ${retryAfterSeconds} seconds.`,
          {
            retryAfterSeconds,
            limit: config.max,
            current: clientRecord.count,
          }
        );
      }

      return handler(request, context);
    };
  };
}
