import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required.")
    .max(80, "Title cannot exceed 80 characters."),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title cannot be empty.")
    .max(80, "Title cannot exceed 80 characters.")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"] as const).optional(),
});
