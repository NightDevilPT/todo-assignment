import { NextRequest } from "next/server";
import { withApiWrapper, withAuth } from "@/middleware";
import { AppError } from "@/middleware/apiWrapper";
import { findUserById } from "@/lib/user";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

export const GET = withApiWrapper(
  withAuth(
    async (request: NextRequest, context: any) => {
      const userId = context?.user?.id;

      if (!userId) {
        throw new AppError(
          HttpStatus.UNAUTHORIZED,
          ErrorCode.UNAUTHORIZED,
          "Access denied. User session is invalid."
        );
      }

      const user = await findUserById(userId);

      if (!user) {
        throw new AppError(
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          "Authenticated user profile could not be found."
        );
      }

      return {
        data: user,
        message: "User profile retrieved successfully.",
        status: HttpStatus.OK,
      };
    }
  )
);
