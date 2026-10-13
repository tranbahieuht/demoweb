"use client";
import Image from "next/image";
import { useState } from "react";
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [broken, setBroken] = useState(false);
  const safeSrc =
    src.startsWith("/") || src.startsWith("https://images.unsplash.com/")
      ? src
      : "/images/fallback.svg";
  return (
    <Image
      src={broken ? "/images/fallback.svg" : safeSrc}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      className={`photo ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
