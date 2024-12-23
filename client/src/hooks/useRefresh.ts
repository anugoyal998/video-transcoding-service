import { api } from "@/api";
import decodeJwt from "@/lib/decodeJwt";
import useAuth, { AuthState } from "@/state/useAuth";
import { JwtPayload, TOKENS } from "@/types";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow"

export const refreshTokenFunction = async (
  token: string,
  setAuth: (auth: AuthState) => void
) => {
  try {
    const { data } = await api.post<TOKENS>("/auth/refresh", {
      refreshToken: token,
    });
    const payload = decodeJwt(data.accessToken) as JwtPayload;
    setAuth({
      name: payload.name,
      username: payload.username,
      email: payload.email,
      profilePhotoUrl: payload.profilePhotoUrl,
      isAuth: true,
    });
    Cookies.set("accessToken", data.accessToken);
    Cookies.set("refreshToken", data.refreshToken);
  } catch (err) {
    alert(err);
  }
};

export default function useRefresh() {
  const setAuth = useAuth(useShallow((state) => state.setAuth));
  const navigate = useNavigate();
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");

  useEffect(() => {
    const redirect_to = new URLSearchParams(window.location.search).get(
      "redirect_to"
    );
    if (redirect_to) navigate(`${redirect_to}`);
    // else if(redirect_to && !auth.isAuth) navigate('/auth/login');
    (async () => {
      if (accessToken && refreshToken) {
        const payload = decodeJwt(accessToken);
        if (payload && typeof payload === "object") {
          setAuth({
            name: payload.name,
            username: payload.username,
            profilePhotoUrl: payload.profilePhotoUrl,
            email: payload.email,
            isAuth: true,
          });
        } else if (payload && typeof payload === "string") {
          await refreshTokenFunction(refreshToken, setAuth);
        }
      } else if (!accessToken && refreshToken) {
        await refreshTokenFunction(refreshToken, setAuth);
      }
    })();
  }, []);
}
