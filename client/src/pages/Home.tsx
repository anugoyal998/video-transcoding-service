import Navbar from "@/components/navbar";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Part {
  ETag: string;
  PartNumber: number;
}

export const chunkSize = 5 * 1024 * 1024; // 5MB
export const PROMISE_ALL_THRESHOLD = 1;

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "progress" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setUploadStatus("idle");
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setUploadStatus("idle");
      const accessToken = Cookies.get("accessToken") as string;
      const totalChunks = Math.ceil(file.size / chunkSize);
      let parts: Part[] = [];

      const { fileName, uploadId, videoId } = await initiateUpload(
        file.name,
        accessToken
      );
      setUploadStatus("progress");
      // let promises = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const fileChunk = file.slice(start, end);

        const { data } = await api.post<{ preSignedUrl: string }>(
          "/upload/presigned-url",
          { fileName, uploadId, partNumber: chunkIndex + 1 },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const response = await axios.put(data.preSignedUrl, fileChunk, {
          headers: { "Content-Type": "application/octet-stream" },
        });
        const eTag = response.headers.etag as string;
        parts.push({
          ETag: eTag.replace(/"/g, ""),
          PartNumber: chunkIndex + 1,
        });
        const uploadedPercentage = Math.round(
          ((chunkIndex + 1) / totalChunks) * 100
        );
        await api.post(
          "/upload/update-upload-progress",
          { videoId, uploadProgress: uploadedPercentage },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setProgress(uploadedPercentage);
      }

      await api.post(
        "/upload/complete",
        { videoId, uploadId, fileName, parts },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUploadStatus("success");
      navigate(`/video/${videoId}`);
    } catch (err) {
      alert("Something went wrong");
      setUploadStatus("error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const initiateUpload = async (fileName: string, token: string) => {
    const { data } = await api.post<{
      uploadId: string;
      fileName: string;
      videoId: string;
    }>(
      "/upload/init",
      { fileName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { ...data };
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setUploadStatus("idle");
    } else {
      alert("Please drop a valid video file");
    }
  };

  return (
    <div>
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-center mt-[10%]">
        Welcome to Video Transcoding
      </h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-1">
            Drag and drop a video file here, or click to select
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </div>
        {file && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Selected file: {file.name}</p>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-2 font-bold py-2 px-4 rounded"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-black h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{progress}% uploaded</p>
          </div>
        )}
        {uploadStatus === "success" && (
          <div className="mt-4 flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Upload successful!</span>
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="mt-4 flex items-center text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Upload failed. Please try again.</span>
          </div>
        )}
      </div>
    </div>
  );
}
