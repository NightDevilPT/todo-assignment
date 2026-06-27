"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Task, TaskStatus } from "@/interfaces/task.interface";
import { ApiPagination, ApiResponse } from "@/interfaces/api.interface";
import { apiService, ApiEndpoints } from "@/lib/api/api.service";

interface TaskContextType {
  tasks: Task[];
  pagination: ApiPagination | null;
  isLoading: boolean;
  error: string | null;
  fetchTasks: (page?: number, limit?: number) => Promise<void>;
  createNewTask: (title: string, description?: string) => Promise<ApiResponse<Task>>;
  changeTaskStatus: (taskId: string, status: TaskStatus) => Promise<ApiResponse<Task>>;
  editTask: (
    taskId: string,
    data: { title?: string; description?: string; status?: TaskStatus }
  ) => Promise<ApiResponse<Task>>;
  removeTask: (taskId: string) => Promise<ApiResponse<{ success: boolean }>>;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

/**
 * TaskProvider Client Component: Wraps elements to manage list state for tasks.
 * Syncs CRUD actions locally and returns the full ApiResponse object to allow trigger-based toasts.
 */
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Fetch user tasks list paginated.
   */
  const fetchTasks = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const url = `${ApiEndpoints.TASKS}?page=${page}&limit=${limit}`;
      const result = await apiService.get<Task[]>(url);

      if (result.data) {
        setTasks(result.data);
        setPagination(result.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create task: POSTs details and prepends the new task to the local state.
   */
  const createNewTask = async (title: string, description?: string): Promise<ApiResponse<Task>> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<Task>(ApiEndpoints.TASKS, { title, description });

      if (result.data) {
        // Prepend task as the list endpoint returns tasks sorted desc
        setTasks((prevTasks) => [result.data!, ...prevTasks]);
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create task.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update task status: PATCHes the status to backend and maps changes locally.
   */
  const changeTaskStatus = async (taskId: string, status: TaskStatus): Promise<ApiResponse<Task>> => {
    try {
      setError(null);
      const url = `${ApiEndpoints.TASKS}/${taskId}`;
      const result = await apiService.patch<Task>(url, { status });

      if (result.data) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === taskId ? { ...t, status: result.data!.status } : t))
        );
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to update task status.");
      throw err;
    }
  };

  /**
   * General Edit Task: Updates task properties (title, description, status) and maps changes locally.
   */
  const editTask = async (
    taskId: string,
    data: { title?: string; description?: string; status?: TaskStatus }
  ): Promise<ApiResponse<Task>> => {
    try {
      setError(null);
      const url = `${ApiEndpoints.TASKS}/${taskId}`;
      const result = await apiService.patch<Task>(url, data);

      if (result.data) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === taskId ? result.data! : t))
        );
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to edit task.");
      throw err;
    }
  };

  /**
   * Delete task: DELETEs from database and filters it out of local state.
   */
  const removeTask = async (taskId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      setError(null);
      const url = `${ApiEndpoints.TASKS}/${taskId}`;
      const result = await apiService.delete<{ success: boolean }>(url);
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to delete task.");
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        pagination,
        isLoading,
        error,
        fetchTasks,
        createNewTask,
        changeTaskStatus,
        editTask,
        removeTask,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
