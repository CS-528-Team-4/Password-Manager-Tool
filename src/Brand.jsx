import React from 'react';
export default function Brand() {
  return (
    <div className="brand">
      <svg className="avast-mark" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="31" fill="#ff8000" />
        <g fill="white">
          <path d="M44 53 22 20c-5-8 2-15 8-12 7 3 10 26 14 45Z" />
          <path d="M43 53 13 32c-7-5-3-12 3-10 8 3 20 22 27 31Z" />
          <path d="m42 53-31-9c-8-2-7-9 0-9 8 1 25 13 31 18Z" />
          <path d="m40 54-28 1c-7 0-7-6-1-7 8-1 22 4 29 6Z" />
        </g>
      </svg>
      <span>Avast</span>
    </div>
  );
}
