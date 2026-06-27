import { NextRequest } from "next/server";
import { withApiWrapper, withAuth, withRateLimit } from "@/middleware";
import { getUserTasks, createTask } from "@/lib/tasks";
import { AppError } from "@/middleware/apiWrapper";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

// GET /api/tasks: Retrieve all tasks of the authenticated user (supports pagination)
export const GET = withApiWrapper(
  withAuth(
    withRateLimit({ windowMs: 60 * 1000, max: 60 })( // Limit: 60 read requests per minute
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

        // Parse search query parameters for pagination
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

        const { tasks, totalItems } = await getUserTasks(userId, page, limit);

        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
          data: tasks,
          message: "Tasks retrieved successfully.",
          status: HttpStatus.OK,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
        };
      }
    )
  )
);

// POST /api/tasks: Create a new task for the authenticated user
export const POST = withApiWrapper(
  withAuth(
    withRateLimit({ windowMs: 60 * 1000, max: 30 })( // Limit: 30 task creations per minute
      async (request: NextRequest, context: any) => {
        const userId = context?.user?.id;

        if (!userId) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Access denied. User session is invalid."
          );
        }

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

        const { title, description } = body;
        const task = await createTask(userId, { title, description });

        return {
          data: task,
          message: "Task created successfully.",
          status: HttpStatus.CREATED,
        };
      }
    )
  )
);
