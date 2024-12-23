import e, { Request, Response, NextFunction } from "express"
import CustomErrorHandler from "../services/CustomErrorHandler"
import { verifyToken } from "../services/generateTokens"

const auth = async (req: Request, res: Response,next: NextFunction) => {
    try {
        let authHeader = req.headers.authorization
        if(!authHeader){
            throw CustomErrorHandler.unAuthorized()
        }
        const token = authHeader.split(' ')[1]
        if(!token){
            throw CustomErrorHandler.unAuthorized()
        }
        const [decoded, error] = verifyToken(token)
        if(error){
            throw error
        }
        // @ts-ignore
        req.user = { username: decoded.username, name: decoded.userDisplayName, email: decoded.email, profilePhotoUrl: decoded.userProfilePhotoUrl };
        next()
    } catch (err) {
        return next(err)
    }
}

export default auth;