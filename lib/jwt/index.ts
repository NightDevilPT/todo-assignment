import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret_key_12345";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_key_67890";

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
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

/**
 * Sign a new long-lived Refresh Token (expires in 7 days)
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
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
