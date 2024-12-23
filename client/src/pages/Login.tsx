import { api } from "@/api";
import LoginForm from "@/components/login-form";
import { AuthForm, SupportedProviders, TOKENS } from "@/types";
import Cookies from "js-cookie";
import React, { useState } from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<AuthForm>({
    provider: SupportedProviders.EMAILPASSWORD,
    username: "",
    password: "",
  });

  async function helper(payload: AuthForm) {
    try {
      setIsLoading(true);
      const { data } = await api.post<TOKENS>("/auth/login", payload);
      Cookies.set("accessToken", data.accessToken);
      Cookies.set("refreshToken", data.refreshToken);
      alert("Login Success");
      window.location.reload();
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      ...formState,
      provider: SupportedProviders.EMAILPASSWORD,
    };
    helper(payload);
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <LoginForm
        action="login"
        formState={formState}
        setFormState={setFormState}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
