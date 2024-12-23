import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { SupportedProviders } from "@prisma/client";
import { db } from "../../db";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { generateTokens } from "../../services/generateTokens";
import bcrypt from "bcrypt";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z
      .object({
        provider: z.enum([
          SupportedProviders.EMAILPASSWORD,
          SupportedProviders.GOOGLE,
          SupportedProviders.GITHUB,
        ]),
        providerId: z.string(),
        username: z.string(),
        name: z.string(),
        email: z.string().email(),
        password: z
          .string()
          .regex(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .optional(),
        profilePhotoUrl: z.string().url(),
      })
      .strict();
    const payload = schema.parse(req.body);
    if (
      payload.provider === SupportedProviders.EMAILPASSWORD &&
      !payload.password
    ) {
      throw new Error("Password is required");
    }
    let hashedPassword = null;
    if (payload.password) {
      hashedPassword = await bcrypt.hash(payload.password, 10);
    }
    let userProviders = await db.user.findFirst({
      where: { username: payload.username },
      select: { providers: true },
    });
    if (!userProviders) {
      await db.user.create({
        data: {
          username: payload.username,
          providers: {
            create: [
              {
                id: payload.providerId,
                providerType: payload.provider,
                userDisplayName: payload.name,
                userProfilePhotoUrl: payload.profilePhotoUrl,
                email: payload.email,
                isEmailPassword:
                  payload.provider === SupportedProviders.EMAILPASSWORD
                    ? true
                    : false,
                isDefault: true,
                ...(payload.password && { password: hashedPassword }),
              },
            ],
          },
        },
      });
      // res.status(200).json({ message: "User Created Successfuly", username: payload.username })
    } else {
      const [filteredProvider] = userProviders.providers.filter(
        (provider) => provider.providerType === payload.provider
      );
      if (filteredProvider) {
        throw CustomErrorHandler.alreadyExist("This email is already in use");
      }
      await db.provider.create({
        data: {
          id: payload.providerId,
          providerType: payload.provider,
          userDisplayName: payload.name,
          userProfilePhotoUrl: payload.profilePhotoUrl,
          email: payload.email,
          isEmailPassword:
            payload.provider === SupportedProviders.EMAILPASSWORD
              ? true
              : false,
          isDefault: false,
          ...(payload.password && { password: hashedPassword }),
          username: payload.username,
        },
      });
      // res.status(200).json({ message: "New Provider Added" })
    }
    userProviders = await db.user.findFirst({
      where: { username: payload.username },
      select: { providers: true },
    });
    const [defaultProvider] = userProviders!.providers.filter(
      (provider) => provider.isDefault
    );
    if (!defaultProvider) throw CustomErrorHandler.serverError();
    const tokenPayload = {
      username: defaultProvider.username,
      name: defaultProvider.userDisplayName,
      email: defaultProvider.email,
      profilePhotoUrl: defaultProvider.userProfilePhotoUrl,
    };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);
    await db.refreshToken.create({ data: { token: refreshToken } });
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};
