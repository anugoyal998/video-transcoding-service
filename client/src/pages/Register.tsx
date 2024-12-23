import LoginForm from "@/components/login-form";
import { AuthForm, SupportedProviders, TOKENS } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createId } from "@paralleldrive/cuid2";
import { generateProfilePhotoUrl } from "@/lib/utils";
import { api } from "@/api";
import Cookies from "js-cookie";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [formState, setFormState] = useState<AuthForm>({
    provider: SupportedProviders.EMAILPASSWORD,
    username,
    password: ""
  });

  useEffect(() => {
    if (!searchParams.get("username")) {
      navigate("/auth");
      return;
    }
    setUsername(searchParams.get("username") as string);
    setFormState((prev) => ({
      ...prev,
      username: searchParams.get("username") as string,
    }));
  }, [searchParams.get("username")]);

  async function helper(payload: AuthForm) {
    try {
      setIsLoading(true);
      const { data } = await api.post<TOKENS>("/auth/register", payload);
      Cookies.set("accessToken", data.accessToken);
      Cookies.set("refreshToken", data.refreshToken);
      alert("Register Success");
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
      providerId: createId(),
      profilePhotoUrl: generateProfilePhotoUrl(formState.name as string),
    };
    helper(payload);
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <LoginForm
        action="register"
        formState={formState}
        setFormState={setFormState}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
