"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FACTORY_VIDEO_PLAYBACK_RATE,
  factoryVideos,
} from "@/lib/factory-videos";
import type { Locale } from "@/types/domain";

export function FactoryVideoGrid({ locale }: { locale: Locale }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % 3), 3000);
    return () => window.clearInterval(timer);
  }, []);

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
      {factoryVideos.slice(0, 3).map((video, index) => (
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
      <div className="relative aspect-[320/243] overflow-hidden bg-black xl:aspect-[80/81]" aria-label={locale === "zh" ? "锆石项链展示" : "Cubic zirconia necklace slideshow"} data-necklace-slide={slide + 1}>
        {[1, 2, 3].map((number, index) => (
          <Image key={number} src={`/media/necklace-slide-${number}.jpg`} alt={locale === "zh" ? `锆石项链 ${number}` : `Cubic zirconia necklace ${number}`} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className={`object-contain transition-opacity duration-700 motion-reduce:transition-none ${slide === index ? "opacity-100" : "opacity-0"}`} aria-hidden={slide !== index} />
        ))}
      </div>
    </div>
  );
}
