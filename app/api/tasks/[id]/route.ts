import { NextRequest } from "next/server";
import { withApiWrapper, withAuth, withRateLimit } from "@/middleware";
import { updateTask, deleteTask } from "@/lib/tasks";
import { AppError } from "@/middleware/apiWrapper";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

// PATCH /api/tasks/[id]: Update a specific task's title, description, or status
export const PATCH = withApiWrapper(
  withAuth(
    withRateLimit({ windowMs: 60 * 1000, max: 40 })( // Limit: 40 update requests per minute
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

        // Await context params for compatibility with Next.js 15+ asynchronous routing contexts
        const params = await context.params;
        const taskId = params.id;

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

        const { title, description, status } = body;
        const updated = await updateTask(userId, taskId, { title, description, status });

        return {
          data: updated,
          message: "Task updated successfully.",
          status: HttpStatus.OK,
        };
      }
    )
  )
);

// DELETE /api/tasks/[id]: Delete a specific task
export const DELETE = withApiWrapper(
  withAuth(
    withRateLimit({ windowMs: 60 * 1000, max: 20 })( // Limit: 20 delete requests per minute
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

        // Await context params for Next.js 15+ compatibility
        const params = await context.params;
        const taskId = params.id;

        const result = await deleteTask(userId, taskId);

        return {
          data: result,
          message: "Task deleted successfully.",
          status: HttpStatus.OK,
        };
      }
    )
  )
);
