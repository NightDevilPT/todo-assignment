"use client";

import React, { useEffect, useState } from "react";
import { useTasks } from "@/components/context/task-context";
import { Task, TaskStatus } from "@/interfaces/task.interface";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";

export function KanbanBoard() {
  const { tasks, isLoading, error, fetchTasks, changeTaskStatus } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tasks on initial mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDropTask = async (taskId: string, targetStatus: TaskStatus) => {
    // Find task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    
    // Avoid API call if status is already correct
    if (task.status === targetStatus) return;

    try {
      await changeTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  // Group tasks by status for Kanban Columns
  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-hidden">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage, organize, and drag tasks across columns to update status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => fetchTasks()}
            title="Refresh board"
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh board</span>
          </Button>

          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 border border-destructive/20 bg-destructive/10 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchTasks()}
            className="text-destructive hover:bg-destructive/10 p-1 px-2.5"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Conditional Grid Rendering */}
      {isLoading && tasks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className="flex flex-col h-full min-h-0 space-y-4">
              <div className="h-8 w-2/3 bg-muted animate-pulse shrink-0" />
              <div className="border p-4 space-y-4 flex-1 overflow-hidden min-h-[300px]">
                {[1, 2].map((cardIndex) => (
                  <div
                    key={cardIndex}
                    className="h-32 w-full bg-muted/40 animate-pulse border shrink-0"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch flex-1 min-h-0 animate-in fade-in duration-200 overflow-hidden">
          <KanbanColumn
            title="To Do"
            status={TaskStatus.TODO}
            tasks={todoTasks}
            onDropTask={handleDropTask}
            onEditClick={handleEditClick}
          />
          <KanbanColumn
            title="In Progress"
            status={TaskStatus.IN_PROGRESS}
            tasks={inProgressTasks}
            onDropTask={handleDropTask}
            onEditClick={handleEditClick}
          />
          <KanbanColumn
            title="Done"
            status={TaskStatus.DONE}
            tasks={doneTasks}
            onDropTask={handleDropTask}
            onEditClick={handleEditClick}
          />
        </div>
      )}

      {/* Global Task Creation/Edit Dialog */}
      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
      />
    </div>
  );
}
