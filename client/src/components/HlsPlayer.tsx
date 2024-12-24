import { api } from "@/api";
import Hls from "hls.js";
import Cookies from "js-cookie";
import { useEffect, useRef } from "react";

interface HlsPlayerProps {
  src: string;
}

export default function HlsPlayer({ src }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const accessToken = Cookies.get("accessToken");

  useEffect(() => {
    if (!accessToken) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.on(Hls.Events.FRAG_LOADING, async (_, data) => {
        // console.log(event, data);
        const segmentUrl = data.frag.url;
        try {
          const response = await api.post<{ preSignedUrl: string }>(
            "/segment",
            { segmentUrl },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const preSignedUrl = response.data.preSignedUrl;
          if (data.frag && preSignedUrl) {
            data.frag.url = preSignedUrl;
          }
        } catch (err) {
          console.error("Failed to fetch presigned URL:", err);
        }
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current!);
      return () => hls.destroy();
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play();
      });
    }
  }, [src, accessToken]);

  return (
    <video ref={videoRef} controls style={{ width: "100%", height: "auto" }} />
  );
}
