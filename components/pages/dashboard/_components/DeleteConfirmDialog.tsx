"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-bold">
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-xs max-w-[280px] mx-auto">
              Are you sure you want to delete this ticket or todo? This action is permanent and cannot be undone.
            </DialogDescription>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            <span>Cancel</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isLoading ? "Deleting..." : "Delete"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
