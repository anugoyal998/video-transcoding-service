import { Request, Response, NextFunction } from "express";
import { z } from "zod"
import { SupportedProviders } from "@prisma/client"
import { db } from "../../db";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { generateTokens, verifyToken } from "../../services/generateTokens";
import { JWT_REFRESH_SECRET } from "../../config";

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            refreshToken: z.string()
        }).strict()
        const { refreshToken } = schema.parse(req.body);
        const refreshTokenDb = await db.refreshToken.findFirst({ where: { token: refreshToken } })
        if (!refreshTokenDb) {
            throw CustomErrorHandler.unAuthorized('Token expired, login again')
        }
        const [decoded, error] = verifyToken(refreshToken, JWT_REFRESH_SECRET)
        if (error) throw error
        // @ts-ignore
        const tokenPayload = { username: decoded.username, name: decoded.userDisplayName, email: decoded.email, profilePhotoUrl: decoded.userProfilePhotoUrl }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);
        await db.refreshToken.create({ data: { token: newRefreshToken } })
        res.status(200).json({ accessToken, refreshToken: newRefreshToken })
    } catch (err) {
        return next(err)
    }
}