import { Request, Response, NextFunction } from "express";
import { z } from "zod"
import { SupportedProviders } from "@prisma/client"
import { db } from "../../db";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { generateTokens } from "../../services/generateTokens";
import bcrypt from "bcrypt"

const matchPassword = async (plainText: string, cipherText: string) => {
    let match;
    let error;
    try {
        match = await bcrypt.compare(plainText, cipherText);
        match = match ? true : false;
    } catch (err) {
        error = err;
    }
    return [match, error]
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            provider: z.enum([SupportedProviders.EMAILPASSWORD, SupportedProviders.GOOGLE, SupportedProviders.GITHUB]),
            username: z.string(),
            password: z.string().regex(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional(),
        }).strict()
        const payload = schema.parse(req.body);
        if (payload.provider === SupportedProviders.EMAILPASSWORD && !payload.password) {
            throw new Error("Password is required")
        }
        const userProviders = await db.user.findFirst({ where: { username: payload.username }, select: { providers: true } })
        if (!userProviders) {
            throw CustomErrorHandler.notFound('User not found')
        }
        const [filteredProvider] = userProviders.providers.filter((provider) => provider.providerType === payload.provider)
        if (!filteredProvider) {
            throw CustomErrorHandler.notFound();
        }
        if (payload.provider === SupportedProviders.EMAILPASSWORD && payload.password) {
            const [match, error] = await matchPassword(payload.password, filteredProvider.password as string)
            if (error) throw error;
            if (!match) throw CustomErrorHandler.wrongCredentials();
        }
        const [defaultProvider] = userProviders.providers.filter((provider) => provider.isDefault)
        if (!defaultProvider) throw CustomErrorHandler.serverError()
        const tokenPayload = { username: defaultProvider.username, name: defaultProvider.userDisplayName, email: defaultProvider.email, profilePhotoUrl: defaultProvider.userProfilePhotoUrl }
        const { accessToken, refreshToken } = generateTokens(tokenPayload);
        await db.refreshToken.create({ data: { token: refreshToken } });
        res.status(200).json({ accessToken, refreshToken })
    } catch (err) {
        return next(err)
    }
}