import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthForm } from "@/types";
import { GrGoogle, GrGithub } from "react-icons/gr";
import React from "react";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  action: "login" | "register";
  formState: AuthForm;
  setFormState: React.Dispatch<React.SetStateAction<AuthForm>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

export default function LoginForm({
  className,
  action,
  formState,
  setFormState,
  handleSubmit,
  isLoading,
  ...props
}: LoginFormProps) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Video Transcoding</CardTitle>
          <CardDescription>
            Enter your email below to {action} to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="username"
                  {...(action === "register" && {
                    defaultValue: formState.username,
                  })}
                  {...(action === "login" && { value: formState.username })}
                  {...(action === "login" && {
                    onChange: handleInputChange,
                  })}
                  required
                />
              </div>
              {action === "register" && (
                <div className="grid gap-2">
                  <Label htmlFor="Name">Name</Label>
                  <Input
                    id="Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              {action === "register" && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {action === "login" && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="capitalize w-full"
                disabled={isLoading}
              >
                {action}
              </Button>
              {/* TODO: Implement Google Sign in */}
              <Button variant="outline" className="w-full" disabled={isLoading}>
                {action.charAt(0).toUpperCase() + action.slice(1)} with{" "}
                <GrGoogle />
              </Button>
              {/* Implement Github Sign in */}
              <Button variant="outline" className="w-full" disabled={isLoading}>
                {action.charAt(0).toUpperCase() + action.slice(1)} with{" "}
                <GrGithub />
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {action === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <a
                href={action === "login" ? "/auth" : "/auth/login"}
                className="underline underline-offset-4"
              >
                {action === "login" ? "Sign up" : "Login"}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
