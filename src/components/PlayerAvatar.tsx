'use client';

import { useState } from 'react';

export default function PlayerAvatar({ photoUrl, initial, name }: {
  photoUrl?: string;
  initial: string;
  name: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shrink-0 border-2 border-white/30 shadow-lg"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl md:text-4xl font-extrabold shrink-0 border-2 border-white/30">
      {initial}
    </div>
  );
}
