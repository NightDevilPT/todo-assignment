"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/interfaces/task.interface";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onEditClick: (task: Task) => void;
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onDropTask,
  onEditClick,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  // Determine status color styles
  const getHeaderStyles = () => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          bg: "bg-zinc-100/80 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300",
          border: "border-zinc-200 dark:border-zinc-850",
          dot: "bg-zinc-400 dark:bg-zinc-500",
        };
      case TaskStatus.IN_PROGRESS:
        return {
          bg: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
          border: "border-blue-100 dark:border-blue-950/50",
          dot: "bg-blue-500",
        };
      case TaskStatus.DONE:
        return {
          bg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
          border: "border-emerald-100 dark:border-emerald-950/50",
          dot: "bg-emerald-500",
        };
    }
  };

  const styles = getHeaderStyles();

  return (
    <div className="flex flex-col h-full min-h-0 min-w-[280px] w-full flex-1 overflow-hidden">
      {/* Column Header */}
      <div className={`flex items-center justify-between pb-3 border-b-2 ${styles.border} mb-4 shrink-0`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <h2 className="font-semibold text-sm tracking-wide text-zinc-700 dark:text-zinc-200 uppercase">
            {title}
          </h2>
          <Badge
            className={`font-semibold rounded-md ${styles.bg} border-0 px-2 py-0.5 text-xs`}
          >
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Droppable Board Section */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 min-h-0"
      >
        <ScrollArea
          className={`h-full rounded-2xl transition-all duration-200 ${isOver
              ? "bg-zinc-100/50 dark:bg-zinc-900/40 ring-2 ring-dashed ring-zinc-300 dark:ring-zinc-700"
              : "bg-zinc-50/30 dark:bg-zinc-950/10"
            }`}
        >
          <div className="p-2.5 flex flex-col gap-3 min-h-full">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <KanbanCard key={task.id} task={task} onEditClick={onEditClick} />
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center text-zinc-400 dark:text-zinc-500 min-h-[250px]">
                <p className="text-xs mb-1 font-medium">No tasks here</p>
                <p className="text-[10px]">Drag tasks here or create new ones</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
