"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";

type PointerZoomImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function PointerZoomImage({
  src,
  alt,
  sizes,
  className = "",
}: PointerZoomImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const updateOrigin = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = `${x}% ${y}%`;
      imageRef.current.style.transform = "scale(1.28)";
    }
  };

  const resetOrigin = () => {
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = "50% 50%";
      imageRef.current.style.transform = "scale(1)";
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#f4f2ef] ${className}`}
      onPointerMove={updateOrigin}
      onPointerLeave={resetOrigin}
    >
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 ease-out"
        sizes={sizes}
      />
    </div>
  );
}
