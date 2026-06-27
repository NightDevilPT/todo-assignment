"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);
    setSuccessAlert(false);

    if (!email || !password || !confirmPassword) {
      setErrorAlert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorAlert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorAlert("Passwords do not match.");
      return;
    }

    try {
      await signup(email, password);
      setSuccessAlert(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorAlert(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {errorAlert && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {errorAlert}
            </div>
          )}
          {successAlert && (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Account created successfully! Redirecting to login...
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || successAlert}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || successAlert}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || successAlert}
              required
            />
          </Field>
          <Field className="flex flex-col gap-2">
            <Button type="submit" className="w-full cursor-pointer mt-2" disabled={isLoading || successAlert}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
            <FieldDescription className="text-center mt-2">
              Already have an account?{" "}
              <Link href="/login" className="underline font-semibold hover:text-muted-foreground">
                Log In
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
