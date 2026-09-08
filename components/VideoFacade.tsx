'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * 유튜브 파사드 — 누르기 전에는 썸네일만, 누르면 iframe 을 만든다.
 * 유튜브 iframe 하나가 첫 화면에서 1MB 넘게 받아 오므로 네 편을 그냥 심으면 첫 화면이 느려진다.
 */
export function VideoFacade({ id, poster, title }: { id: string; poster: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-night">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`${title} 재생`}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-night"
    >
      <Image src={poster} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      <span aria-hidden className="absolute inset-0 bg-night/25 transition-colors group-hover:bg-night/15" />
      <span aria-hidden className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-700/90 shadow-lg ring-4 ring-white/30 transition-transform group-hover:scale-110">
        <span className="ml-1 block h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-white" />
      </span>
    </button>
  );
}
