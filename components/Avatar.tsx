"use client";
import { useState } from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

/**
 * User avatar. Uses a plain <img> (Google `picture` URLs are remote — this avoids
 * configuring next/image remotePatterns) and falls back to the user's initial in an
 * orange circle if there's no image or it fails to load.
 */
export default function Avatar({ src, name, size = 32, className = "" }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const initial = (name?.trim()?.[0] || "?").toUpperCase();
  const dim = { width: size, height: size };

  if (!src || broken) {
    return (
      <span
        style={dim}
        className={`inline-flex items-center justify-center rounded-full bg-[#FF5623]/12 text-[#FF5623] font-bold flex-shrink-0 ${className}`}
      >
        <span style={{ fontSize: size * 0.42 }}>{initial}</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name || "User"}
      style={dim}
      onError={() => setBroken(true)}
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
    />
  );
}
