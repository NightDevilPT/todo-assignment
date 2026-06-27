import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/client";
import { AppError } from "@/middleware/apiWrapper";
import { HttpStatus, ErrorCode } from "@/interfaces/api.interface";
import { findUserByEmail } from "@/lib/user";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

/**
 * Register a new user: Validates email/password, hashes password, and stores in the DB.
 */
export async function registerUser(email: string, password: string) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid email format");
  }

  // Validate password length
  if (password.length < 6) {
    throw new AppError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Password must be at least 6 characters long");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Log in a user: Validates credentials, signs Access and Refresh tokens, and saves session metadata.
 */
export async function loginUser(email: string, password: string, userAgent?: string, ipAddress?: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Invalid email or password");
  }

  // Define Refresh Token expiry (7 Days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Initialize DB Session (pre-sign token)
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: "", // Populated after signing
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, sessionId: session.id });

  // Update session with signed Refresh Token
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh a session: Validates a Refresh Token, checks DB session state, and issues a new Access Token.
 */
export async function refreshSession(refreshToken: string, userAgent?: string, ipAddress?: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Invalid or expired session token");
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Session has expired or been revoked");
  }

  // Update session audit fields
  await prisma.session.update({
    where: { id: session.id },
    data: {
      userAgent: userAgent || session.userAgent,
      ipAddress: ipAddress || session.ipAddress,
    },
  });

  const accessToken = signAccessToken({ userId: session.user.id, email: session.user.email });
  return {
    accessToken,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
  };
}

/**
 * Revoke a session: Invalidates a Refresh Token inside the database (used for logout).
 */
export async function revokeSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, "Invalid token");
  }

  await prisma.session.updateMany({
    where: {
      id: payload.sessionId,
    },
    data: {
      isRevoked: true,
    },
  });

  return { success: true };
}
