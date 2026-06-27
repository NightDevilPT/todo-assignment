"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);

    if (!email || !password) {
      setErrorAlert("Please enter both email and password.");
      return;
    }

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorAlert(err.message || "Invalid credentials. Please try again.");
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
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </Field>
          <Field className="flex flex-col gap-2">
            <Button type="submit" className="w-full cursor-pointer mt-2" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <FieldDescription className="text-center mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline font-semibold hover:text-muted-foreground">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
