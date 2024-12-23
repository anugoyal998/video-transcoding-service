import { AuthState } from "./state/useAuth";

export enum SupportedProviders {
    EMAILPASSWORD = "EMAILPASSWORD",
    GOOGLE = "GOOGLE",
    GITHUB = "GITHUB"
}

export type AuthForm = {
    provider: SupportedProviders;
    providerId?: string;
    username: string;
    name?: string;
    email?: string;
    password?: string;
    profilePhotoUrl?: string;
}

export type TOKENS = {
    accessToken: string;
    refreshToken: string;
}

export type JwtPayload = Omit<AuthState,"isAuth"> & {
    createdAt: number;
    iat?: number;
    exp?: number;
}

export enum SupportedTranscodingFormats {
    FORMAT_240 = "FORMAT_240",
    FORMAT_360 = "FORMAT_360",
    FORMAT_480 = "FORMAT_480",
    FORMAT_720 = "FORMAT_720",
    FORMAT_1080 = "FORMAT_1080"
  }