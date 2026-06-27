import { NextRequest } from "next/server";
import { withApiWrapper, withRateLimit } from "@/middleware";
import { AppError } from "@/middleware/apiWrapper";
import { registerUser } from "@/lib/auth";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

export const POST = withApiWrapper(
  withRateLimit({ windowMs: 60 * 1000, max: 10 })( // Limit: 10 signups per IP per minute
    async (request: NextRequest) => {
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

      const user = await registerUser(email, password);

      return {
        data: user,
        message: "User registered successfully.",
        status: HttpStatus.CREATED,
      };
    }
  )
);
