import express from "express";
import authMiddleware from "./middleware/auth"
import auth from "./controllers/auth"
import upload from "./controllers/upload";
import video from "./controllers/video";
import transcode from "./controllers/transcode";

const router = express.Router();

// auth
router.post("/auth/register", auth.register)
router.post("/auth/login", auth.login)
router.post("/auth/refresh", auth.refresh)
router.post("/auth/whoAmI", authMiddleware, auth.whoAmI)
router.post("/auth/logout", authMiddleware, auth.logout)

// upload
router.post("/upload/init", authMiddleware, upload.initUpload)
router.post("/upload/presigned-url", authMiddleware, upload.uploadMultiPart)
router.post("/upload/update-upload-progress", authMiddleware, upload.updateUploadProgress)
router.post("/upload/complete", authMiddleware, upload.completeUpload)

// video
router.get("/video/:id/:format", authMiddleware, video.getVideo);
router.get("/videos", authMiddleware, video.getVideos);

// transcode
router.post("/transcode/start", authMiddleware, transcode.startTranscoding);

export default router;