import { useState } from 'react';

export default function AvatarIcon({ picture, initials, size = 32, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const showImage = picture && !imgError;

  const style = { width: size, height: size, minWidth: size };

  if (showImage) {
    return (
      <img
        src={picture}
        alt={initials}
        style={style}
        className={`rounded-full object-cover border-[1.5px] border-[#1E293B] ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full flex items-center justify-center font-bold border border-[#1E293B] ${className}`}
    >
      {initials}
    </div>
  );
}
