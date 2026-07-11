"use client";

import { useEffect, useRef } from "react";
import {
  FACTORY_VIDEO_PLAYBACK_RATE,
  factoryVideos,
} from "@/lib/factory-videos";
import type { Locale } from "@/types/domain";

export function FactoryVideoGrid({ locale }: { locale: Locale }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const setPlaybackRate = (video: HTMLVideoElement) => {
      video.playbackRate = FACTORY_VIDEO_PLAYBACK_RATE;
    };

    const videos = videoRefs.current.filter(
      (video): video is HTMLVideoElement => video !== null,
    );

    const removeListeners = videos.map((video) => {
      const handleLoadedMetadata = () => setPlaybackRate(video);
      setPlaybackRate(video);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    });

    return () => {
      removeListeners.forEach((removeListener) => removeListener());
      videos.forEach((video) => video.pause());
    };
  }, []);

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {factoryVideos.map((video, index) => (
        <div key={video.src} className="aspect-[320/243] overflow-hidden xl:aspect-[80/81]">
          <video
            ref={(element) => {
              videoRefs.current[index] = element;
            }}
            className="size-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={locale === "zh" ? video.titleZh : video.titleEn}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
}
