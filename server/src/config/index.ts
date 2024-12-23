import { SupportedTranscodingFormats } from "@prisma/client"
import "dotenv/config"

export const PORT = process.env.PORT || 5000
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"
export const AWS_REGION = process.env.AWS_REGION as string
export const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY as string
export const AWS_S3_SECRET_KEY = process.env.AWS_S3_SECRET_KEY as string
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string
export const DEFAULT_RESOLUTION = SupportedTranscodingFormats.FORMAT_360.split("_")[1] + 'p';
// export const KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID as string
// export const KINDE_BASE_URL = process.env.KINDE_BASE_URL as string
// export const KINDE_SITE_URL = process.env.KINDE_SITE_URL as string
// export const KINDE_SECRET = process.env.KINDE_SECRET as string
// export const KINDE_REDIRECT_URL = process.env.KINDE_REDIRECT_URL as string
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string
export const REDIS_HOST = process.env.REDIS_HOST as string
export const REDIS_USER = process.env.REDIS_USER as string
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string
export const REDIS_PORT = process.env.REDIS_PORT as string
