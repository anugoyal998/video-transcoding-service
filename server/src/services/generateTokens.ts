import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config"

export const generateTokens = (payload: any) => {
    const accessToken = createToken(payload);
    const refreshToken = createToken(payload, JWT_REFRESH_SECRET)
    return { accessToken, refreshToken }
}

export const createToken = (payload: any, secret: string = JWT_ACCESS_SECRET, expiry: string = '1h') => {
    return jwt.sign({ ...payload, createdAt: Date.now() }, secret, { expiresIn: expiry })
}

export const verifyToken = (token: string, secret: string = JWT_ACCESS_SECRET) => {
    let decoded;
    let error;
    try {
        decoded = jwt.verify(token, secret)
    } catch (err) {
        error = err
    }
    return [decoded, error]
}