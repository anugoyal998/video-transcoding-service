import { SupportedTranscodingFormats } from "@prisma/client";

const RESOLUTIONS = {
  [SupportedTranscodingFormats.FORMAT_240]: {
    name: "240p",
    width: 320,
    height: 240,
  },
  [SupportedTranscodingFormats.FORMAT_360]: {
    name: "360p",
    width: 480,
    height: 360,
  },
  [SupportedTranscodingFormats.FORMAT_480]: {
    name: "480p",
    width: 640,
    height: 480,
  },
  [SupportedTranscodingFormats.FORMAT_720]: {
    name: "720p",
    width: 1280,
    height: 720,
  },
  [SupportedTranscodingFormats.FORMAT_1080]: {
    name: "1080p",
    width: 1920,
    height: 1080,
  },
};

export const getResolutionInfo = (format: SupportedTranscodingFormats) =>
  RESOLUTIONS[format];
