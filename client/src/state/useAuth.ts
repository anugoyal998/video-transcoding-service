import { create } from "zustand";

export type AuthState = {
  username: string;
  name: string;
  email: string;
  profilePhotoUrl: string;
  isAuth: boolean;
};

type AuthStore = {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
};

const useAuth = create<AuthStore>((set) => ({
  auth: {
    username: "",
    name: "",
    email: "",
    profilePhotoUrl: "",
    isAuth: false,
  },
  setAuth: (auth) => set(() => ({ auth })),
}));

export default useAuth;