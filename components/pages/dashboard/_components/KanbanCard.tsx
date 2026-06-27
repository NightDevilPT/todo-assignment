"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/interfaces/task.interface";
import { useTasks } from "@/components/context/task-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { MoreHorizontal, Calendar, Edit, Trash2 } from "lucide-react";

interface KanbanCardProps {
  task: Task;
  onEditClick: (task: Task) => void;
}

export function KanbanCard({ task, onEditClick }: KanbanCardProps) {
  const { removeTask } = useTasks();
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDraggingLocal(true);
  };

  const handleDragEnd = () => {
    setIsDraggingLocal(false);
  };

  const handleDeleteTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await removeTask(task.id);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete task", err);
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case TaskStatus.TODO:
        return (
          <Badge variant="secondary" className="font-semibold text-[10px] shadow-none">
            To Do
          </Badge>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500/20 font-semibold text-[10px] shadow-none">
            In Progress
          </Badge>
        );
      case TaskStatus.DONE:
        return (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 font-semibold text-[10px] shadow-none">
            Completed
          </Badge>
        );
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`group cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
          isDraggingLocal ? "opacity-35 scale-[0.98] shadow-none" : "opacity-100 hover:-translate-y-1"
        }`}
      >
        <Card className="border bg-card text-card-foreground shadow-xs group-hover:shadow-md transition-all overflow-hidden">
          <CardContent className="p-4 flex flex-col gap-3">
            
            {/* Header: Title & Actions Dropdown */}
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-semibold text-sm leading-snug transition-colors line-clamp-2">
                {task.title}
              </h3>
              
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:bg-muted h-8 w-8 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open actions menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[130px]">
                    <DropdownMenuItem
                      onClick={() => onEditClick(task)}
                      className="flex items-center gap-2 cursor-pointer text-xs font-medium"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Task</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDeleteTrigger}
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Task</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description Body */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            )}

            {/* Footer metadata */}
            <div className="flex items-center justify-between pt-2.5 border-t text-[10px] text-muted-foreground">
              
              {/* Calendar Date badge */}
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatDate(task.createdAt)}</span>
              </div>
              
              {/* Status Pill Badge */}
              <div>
                {getStatusBadge()}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
