"use client";

import React, { useState, useEffect } from "react";
import { useTasks } from "@/components/context/task-context";
import { Task, TaskStatus } from "@/interfaces/task.interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { AlertCircle, FileText, AlignLeft, Tag, Check, X } from "lucide-react";

interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

const TITLE_MAX_LENGTH = 80;
const DESC_MAX_LENGTH = 500;

export function TaskDialog({ isOpen, onOpenChange, task }: TaskDialogProps) {
  const { createNewTask, editTask, removeTask, isLoading } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Initialize fields on toggle
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
      } else {
        setTitle("");
        setDescription("");
        setStatus(TaskStatus.TODO);
      }
      setError(null);
      setIsDeleteOpen(false);
    }
  }, [isOpen, task]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= TITLE_MAX_LENGTH) {
      setTitle(val);
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= DESC_MAX_LENGTH) {
      setDescription(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setError(null);
      if (task) {
        await editTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
        });
      } else {
        const createResult = await createNewTask(title.trim(), description.trim() || undefined);
        if (createResult.data && status !== TaskStatus.TODO) {
          await editTask(createResult.data.id, { status });
        }
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving your task.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    try {
      setError(null);
      await removeTask(task.id);
      setIsDeleteOpen(false);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to delete task.");
      setIsDeleteOpen(false);
    }
  };

  const isEditMode = !!task;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          
          {/* Visual Header */}
          <div className="p-6 pb-4 border-b bg-muted/20">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                {isEditMode ? "Task Details" : "Create Task"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditMode
                  ? "View and edit task details, adjust progress state, or delete the card."
                  : "Add details to organize and register your new task card."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            <FieldGroup className="space-y-5">
              
              {/* Error alerts */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Task Title Field */}
              <Field className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <FieldLabel htmlFor="title" className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Task Title</span>
                  </FieldLabel>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {title.length}/{TITLE_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="What needs to be done?"
                  className="w-full text-sm py-2 px-3 transition-all"
                  disabled={isLoading}
                  required
                />
              </Field>

              {/* Task Description Field */}
              <Field className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <FieldLabel htmlFor="description" className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Description</span>
                  </FieldLabel>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {description.length}/{DESC_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={handleDescChange}
                  placeholder="Include a description or notes..."
                  rows={4}
                  disabled={isLoading}
                />
              </Field>

              {/* Task Status Field */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="status-select" className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Task Status</span>
                </FieldLabel>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as TaskStatus)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="status-select"
                    className="w-full text-left"
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value={TaskStatus.TODO}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground shrink-0" />
                        <span className="font-medium">To Do</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-medium">In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-medium">Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            {/* Form Actions Footer */}
            <DialogFooter className="mt-6 bg-transparent grid grid-cols-2 gap-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title.trim()}
              >
                <Check className="h-4 w-4" />
                <span>{isLoading ? "Saving..." : isEditMode ? "Save changes" : "Create task"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Overlay Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </>
  );
}
