import { api } from "@/api";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import VideoPreview from "@/components/video-preview";
import { SupportedTranscodingFormats } from "@/types";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactHlsPlayer from "react-hls-player";
import { Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateS3Url } from "@/lib/utils";

enum VideoUploadStatus {
  STARTED = "STARTED",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

enum VideoTranscodeStatus {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type VideoDetails = {
  id: string;
  fileName: string;
  multipartUploadId: string;
  originalS3Path: string;
  uploadProgress: number;
  uploadStatus: VideoUploadStatus;
  transcodeProgress: number;
  transcodeStatus: VideoTranscodeStatus;
  transcodedFormats: SupportedTranscodingFormats[];
  transcodedS3Path: string;
  createdAt: Date;
  preSignedUrl?: string;
  thumbnail?: string;
};

export default function Video() {
  const [formats, setFormats] = useState<SupportedTranscodingFormats[]>([]);
  const playerRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetchVideo, setIsRefetchVideo] = useState(false);
  const [currentResolution, setCurrentResolution] =
    useState<SupportedTranscodingFormats>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const { id } = useParams();
  const accessToken = Cookies.get("accessToken");

  useEffect(() => {
    if (!id || !accessToken) return;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<VideoDetails>(
          `/video/${id}/${currentResolution}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setVideoDetails({ ...data });
        setCurrentResolution(data.transcodedFormats[0]);
      } catch (err) {
        alert(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, accessToken, isRefetchVideo, currentResolution]);

  const handleFormatChange = (format: SupportedTranscodingFormats) => {
    setFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formats.length === 0 || !videoDetails) return;
    try {
      setIsLoading(true);
      await api.post(
        "/transcode/start",
        {
          videoId: videoDetails.id,
          transcodedFormats: [...formats],
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setIsRefetchVideo((prev) => !prev);
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleResolutionChange = (format: SupportedTranscodingFormats) => {
    setCurrentResolution(format);
    setIsSettingsOpen(false);
  };

  if (isLoading || !videoDetails) return <Loading />;

  return (
    <div>
      <Navbar />
      {/* TODO: handle start transcode video button */}
      {(videoDetails.transcodeStatus === VideoTranscodeStatus.NOT_STARTED ||
        videoDetails.transcodeStatus === VideoTranscodeStatus.FAILED) && (
        <div className="w-screen flex justify-center items-center">
          <Card className="m-5 md:flex" style={{ minWidth: "60%" }}>
            <CardContent className="p-2">
              <VideoPreview
                title={videoDetails.fileName}
                poster={
                  videoDetails.thumbnail
                    ? generateS3Url(videoDetails.thumbnail)
                    : undefined
                }
                className="border-none shadow-none"
              />
            </CardContent>
            <div>
              <CardHeader>
                <CardTitle>Transcode Video</CardTitle>
                <CardDescription>
                  Select output formats for transcoding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label>Output Formats</Label>
                    {Object.values(SupportedTranscodingFormats).map(
                      (format) => (
                        <div
                          key={format}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={format}
                            checked={formats.includes(format)}
                            onCheckedChange={() => handleFormatChange(format)}
                          />
                          <Label htmlFor={format}>
                            {format.split("_")[1]}p
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={formats.length === 0 || isLoading}
                  >
                    Start Transcoding
                  </Button>
                </form>
              </CardContent>
            </div>
          </Card>
        </div>
      )}
      {(videoDetails.transcodeStatus === VideoTranscodeStatus.STARTED ||
        videoDetails.transcodeStatus === VideoTranscodeStatus.PROGRESS) && (
        <div className="w-screen flex justify-center items-center">
          <Card className="m-5 md:flex" style={{ minWidth: "60%" }}>
            <CardContent className="p-2 w-full">
              <p>Processing: {videoDetails.fileName}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {videoDetails.transcodeStatus === VideoTranscodeStatus.COMPLETED &&
        videoDetails.preSignedUrl && (
          <div className="w-screen flex justify-center items-center">
            <Card className="m-5 md:flex" style={{ minWidth: "60%" }}>
              <CardContent className="p-2 w-full relative">
                <ReactHlsPlayer
                  playerRef={playerRef}
                  src={videoDetails.preSignedUrl}
                  autoPlay={false}
                  controls
                  height="auto"
                  width="100%"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <DropdownMenu
                    open={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/75"
                      >
                        <Settings className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {/* <DropdownMenuItem
                        onClick={() => handleResolutionChange(null)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>Auto</span>
                          {isAuto && <ChevronDown className="h-4 w-4" />}
                        </div>
                      </DropdownMenuItem> */}
                      {videoDetails.transcodedFormats.map((format) => (
                        <DropdownMenuItem
                          key={format}
                          onClick={() => handleResolutionChange(format)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{format.split("_")[1]}p</span>
                            {currentResolution === format && (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
