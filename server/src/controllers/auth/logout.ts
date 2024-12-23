import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { db } from "../../db"

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            refreshToken: z.string()
        }).strict()
        const { refreshToken } = schema.parse(req.body)
        await db.refreshToken.delete({ where: { token: refreshToken }})
        res.status(200).json({ message: "Logout successfull"})
    } catch (err) {
        return next(err)
    }
}