import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { VideoDetails } from "./Video";
import Cookies from "js-cookie";
import { api } from "@/api";
import VideoPreview from "@/components/video-preview";
import { generateS3Url } from "@/lib/utils";

export default function Videos() {
  const [videos, setVideos] = useState<VideoDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = Cookies.get("accessToken");
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<VideoDetails[]>(`/videos`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setVideos([...data]);
      } catch (err) {
        alert(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [accessToken]);

  return (
    <div>
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-3 mx-3">My Videos</h1>
      {!isLoading && videos.length === 0 && <div>No Videos found</div>}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <a href={`/video/${video.id}`} key={video.id}>
            <VideoPreview
              title={video.fileName}
              poster={
                video.thumbnail ? generateS3Url(video.thumbnail) : undefined
              }
            />
          </a>
        ))}
      </div>
    </div>
  );
}
