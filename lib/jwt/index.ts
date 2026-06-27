import jwt from "jsonwebtoken";
import { config } from "../config";

const ACCESS_SECRET = config.jwt.accessSecret;
const REFRESH_SECRET = config.jwt.refreshSecret;

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

/**
 * Sign a new short-lived Access Token (expires in 15 minutes)
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const expiry = config.jwt.accessExpiry;
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: expiry });
}

/**
 * Sign a new long-lived Refresh Token (expires in 20 minutes)
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  const expiry = config.jwt.refreshExpiry;
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: expiry });
}

/**
 * Verifies an Access Token and returns the decoded payload. Returns null if invalid or expired.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies a Refresh Token and returns the decoded payload. Returns null if invalid or expired.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
