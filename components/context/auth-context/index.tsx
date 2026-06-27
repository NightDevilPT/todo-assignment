"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@/interfaces/user.interface";
import { apiService, ApiEndpoints } from "@/lib/api/api.service";
import { ApiResponse } from "@/interfaces/api.interface";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse<{ user: User }>>;
  signup: (email: string, password: string) => Promise<ApiResponse<User>>;
  logout: () => Promise<ApiResponse<null>>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Client Component: Wraps layout nodes to manage authentication states.
 * Automatically re-hydrates user status on mount and returns full ApiResponses for custom UI toast bindings.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Hydrate user profile from cookie sessions on page load
  const fetchMe = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await apiService.get<User>(ApiEndpoints.ME);
      if (result.data) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /**
   * Login request: POST /api/auth/login.
   * Returns ApiResponse to allow visual toast notifications at page levels.
   */
  const login = async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<{ user: User }>(ApiEndpoints.LOGIN, { email, password });
      
      if (result.data) {
        setUser(result.data.user);
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Login failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signup request: POST /api/auth/signup.
   */
  const signup = async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<User>(ApiEndpoints.SIGNUP, { email, password });
      return result;
    } catch (err: any) {
      setError(err.message || "Signup failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout request: POST /api/auth/logout.
   */
  const logout = async (): Promise<ApiResponse<null>> => {
    try {
      setIsLoading(true);
      const result = await apiService.post<null>(ApiEndpoints.LOGOUT);
      setUser(null);
      return result;
    } catch (err: any) {
      setUser(null); // Clear state even if fetch fails
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
