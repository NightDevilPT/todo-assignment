import { NextRequest } from "next/server";
import { withApiWrapper, withAuth, withRateLimit } from "@/middleware";
import { updateTask, deleteTask } from "@/lib/tasks";
import { AppError } from "@/middleware/apiWrapper";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { updateTaskSchema } from "@/lib/tasks/validation";
import { config } from "@/lib/config";

// PATCH /api/tasks/[id]: Update a specific task's title, description, or status
export const PATCH = withApiWrapper(
  withAuth(
    withRateLimit(config.rateLimits.tasks.update)(
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

        // Await dynamic route parameters
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

        const validationResult = updateTaskSchema.safeParse(body);
        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0]?.message || "Validation failed.";
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
            firstError
          );
        }

        const { title, description, status } = validationResult.data;
        const updated = await updateTask(userId, taskId, {
          title,
          description: description ?? undefined,
          status,
        });

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
    withRateLimit(config.rateLimits.tasks.delete)(
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

        // Await dynamic route parameters
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
