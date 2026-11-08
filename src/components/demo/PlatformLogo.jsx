import React from 'react';
import { GraduationCap, ShoppingBag, Globe } from 'lucide-react';
export default function PlatformLogo({ platform }) {
  return (
    <span className={'platform-logo ' + platform.theme} aria-hidden="true">
      {platform.theme === 'google' ? (
        <svg viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.78-4.59l-7.98-6.19A23.89 23.89 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6C30.01 37.65 27.24 38.5 24 38.5c-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
          />
        </svg>
      ) : platform.theme === 'youtube' ? (
        <svg viewBox="0 0 64 46">
          <path
            fill="#FF0033"
            d="M62.7 7.2A8 8 0 0 0 57.1 1.5C52.1 0 32 0 32 0S11.9 0 6.9 1.5A8 8 0 0 0 1.3 7.2C0 12.2 0 23 0 23s0 10.8 1.3 15.8a8 8 0 0 0 5.6 5.7C11.9 46 32 46 32 46s20.1 0 25.1-1.5a8 8 0 0 0 5.6-5.7C64 33.8 64 23 64 23s0-10.8-1.3-15.8Z"
          />
          <path fill="#fff" d="m25.5 33 17-10-17-10Z" />
        </svg>
      ) : platform.theme === 'school' ? (
        <GraduationCap strokeWidth={1.6} />
      ) : platform.theme === 'shop' ? (
        <ShoppingBag strokeWidth={1.6} />
      ) : (
        <Globe strokeWidth={1.6} />
      )}
    </span>
  );
}
