import { SignOptions } from "jsonwebtoken";

export const config = {
  db: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/todo_db?schema=public",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_key_12345",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_key_67890",
    accessExpiry: (process.env.JWT_ACCESS_EXPIRY || "15m") as SignOptions["expiresIn"],
    refreshExpiry: (process.env.JWT_REFRESH_EXPIRY || "20m") as SignOptions["expiresIn"],
    accessMaxAge: parseInt(process.env.JWT_ACCESS_MAX_AGE || "900", 10),
    refreshMaxAge: parseInt(process.env.JWT_REFRESH_MAX_AGE || "1200", 10),
  },
  rateLimits: {
    signup: { windowMs: 60 * 1000, max: 10 },
    login: { windowMs: 60 * 1000, max: 15 },
    tasks: {
      get: { windowMs: 60 * 1000, max: 60 },
      create: { windowMs: 60 * 1000, max: 30 },
      update: { windowMs: 60 * 1000, max: 40 },
      delete: { windowMs: 60 * 1000, max: 20 },
    },
  },
  isProduction: process.env.NODE_ENV === "production",
  env: process.env.NODE_ENV || "development",
};
