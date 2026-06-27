import { NextRequest } from "next/server";
import { withApiWrapper, withRateLimit } from "@/middleware";
import { AppError } from "@/middleware/apiWrapper";
import { registerUser } from "@/lib/auth";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { signupSchema } from "@/lib/user/validation";
import { config } from "@/lib/config";

export const POST = withApiWrapper(
  withRateLimit(config.rateLimits.signup)(
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

      const validationResult = signupSchema.safeParse(body);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0]?.message || "Validation failed.";
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          firstError
        );
      }

      const { email, password } = validationResult.data;

      const user = await registerUser(email, password);

      return {
        data: user,
        message: "User registered successfully.",
        status: HttpStatus.CREATED,
      };
    }
  )
);
