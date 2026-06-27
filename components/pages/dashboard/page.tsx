"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/auth-context";
import { KanbanBoard } from "./_components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect to login if user is unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Show theme-compliant loading screen when checking auth status
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing loading ring using border variables */}
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute h-full w-full rounded-full border-4 border-muted" />
            <div className="absolute h-full w-full rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Sticky Theme-Compliant Top Nav */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md shrink-0">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">
              TaskBoard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User Profile Tag */}
            <div className="w-6 h-6 bg-primary rounded-full text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user?.email[0].toUpperCase()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="flex-1 container mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 overflow-hidden flex flex-col min-h-0">
        <KanbanBoard />
      </main>
    </div>
  );
}
