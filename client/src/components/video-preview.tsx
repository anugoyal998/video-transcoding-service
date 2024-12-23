import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface VideoPreviewProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  // duration: number;
  poster?: string;
}

export default function VideoPreview({
  title,
  poster,
  ...props
}: VideoPreviewProps) {
  return (
    <Card {...props}>
      <CardContent className="p-4">
        <div className="aspect-video relative">
          <img
            src={poster ?? `https://picsum.photos/seed/${title}/640/360`}
            className="w-full h-full object-cover rounded-md cursor-pointer"
          />
          {/* <video
            src={url}
            poster={poster ?? `https://picsum.photos/seed/${title}/640/360`}
            className="w-full h-full object-cover rounded-md"
            controls
          >
            Your browser does not support the video tag.
          </video> */}
        </div>
        <h3 className="mt-2 text-lg font-semibold">{title}</h3>
        {/* <p className="text-sm text-gray-500">
          Duration: {Math.floor(video.duration / 60)}:
          {(video.duration % 60).toString().padStart(2, "0")}
        </p> */}
      </CardContent>
    </Card>
  );
}
