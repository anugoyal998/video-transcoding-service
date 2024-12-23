import { ConnectionOptions } from "bullmq";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from "./config";

export const redisConnection: ConnectionOptions = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  username: REDIS_USER,
  password: REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false
  }
};
