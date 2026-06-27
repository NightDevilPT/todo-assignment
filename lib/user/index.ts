import { prisma } from "@/prisma/client";

/**
 * Find user details by their ID (excludes sensitive fields like password).
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Find a full user record by email (includes password for credential validation).
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
