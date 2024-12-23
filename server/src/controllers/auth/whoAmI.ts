import { Request, Response, NextFunction } from "express"
import { TOKEN_PAYLOAD } from "../../types"
import { db } from "../../db"
import CustomErrorHandler from "../../services/CustomErrorHandler"

export const whoAmI = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const payload = req.user as TOKEN_PAYLOAD;
        const user = await db.user.findFirst({ where: { username: payload.username }, select: { username: true, providers: { select: { email: true, isDefault: true, isEmailPassword: true, providerType: true, userDisplayName: true, username: true, userProfilePhotoUrl: true }, where: { isDefault: true } } } })
        if (!user) throw CustomErrorHandler.serverError()
        res.status(200).json(user)
    } catch (err) {
        return next(err)
    }
}