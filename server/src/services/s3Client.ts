import { S3Client } from "@aws-sdk/client-s3";
import { AWS_REGION, AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from "../config";

const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY,
        secretAccessKey: AWS_S3_SECRET_KEY
    }
})

export default s3Client