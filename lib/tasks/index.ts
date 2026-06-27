import { prisma } from "@/prisma/client";
import { TaskStatus } from "@/app/generated/prisma";
import { AppError } from "@/middleware/apiWrapper";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";

/**
 * Fetch all tasks created by a specific user, supporting pagination options.
 */
export async function getUserTasks(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [tasks, totalItems] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.task.count({
      where: { userId },
    }),
  ]);

  return { tasks, totalItems };
}

/**
 * Create a new task for a user. Title is required.
 */
export async function createTask(userId: string, data: { title: string; description?: string }) {
  if (!data.title || data.title.trim() === "") {
    throw new AppError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Task title is required.");
  }

  return prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      userId,
    },
  });
}

/**
 * Update task properties. Ensures the task belongs to the user before editing.
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: { title?: string; description?: string; status?: TaskStatus }
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      "Task not found or access was denied."
    );
  }

  // Validate status if provided
  if (data.status && !Object.values(TaskStatus).includes(data.status)) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      `Invalid task status. Allowed values are: ${Object.values(TaskStatus).join(", ")}`
    );
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title !== undefined ? data.title.trim() : undefined,
      description: data.description !== undefined ? data.description?.trim() || null : undefined,
      status: data.status !== undefined ? data.status : undefined,
    },
  });
}

/**
 * Delete a specific task. Ensures the task belongs to the user before deleting.
 */
export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      "Task not found or access was denied."
    );
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { success: true };
}
