import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateProfilePhotoUrl(name: string){
  return `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name)}`
}

export function generateS3Url(path: string) {
  return `https://video-transcoding-anugoyal998.s3.eu-north-1.amazonaws.com/${path}`
}