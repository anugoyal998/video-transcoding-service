import express from "express";
import cors from "cors";
import { FRONTEND_URL, PORT } from "./config";
import router from "./router";
import errorHandler from "./middleware/errorHandler";
import { TOKEN_PAYLOAD } from "./types"

declare global {
    namespace Express {
        interface Request {
            user?: TOKEN_PAYLOAD
        }
    }
}

const app = express();

app.use(express.json())
app.use(cors({
    origin: [FRONTEND_URL,"http://localhost:3000"],
    credentials: true
}))
app.use(errorHandler)
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`)
})
