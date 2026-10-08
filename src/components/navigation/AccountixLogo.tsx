import React from 'react';

interface AccountixLogoProps {
  onClick?: () => void;
}

export const AccountixLogo: React.FC<AccountixLogoProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1 transition-transform active:scale-[0.98]"
      title="ACCOUNTIX - Return to Dashboard"
      aria-label="ACCOUNTIX Dashboard"
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center w-7 h-7 rounded bg-[#0B2545] text-white shrink-0 shadow-2xs">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4.5 h-4.5 text-white"
        >
          <path
            d="M16 4L6 26H11.5L16 15.5L20.5 26H26L16 4Z"
            fill="currentColor"
          />
          <path
            d="M10 20.5H22"
            stroke="#93C5FD"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <span className="text-base font-extrabold tracking-tight text-[#0B2545]">
        ACCOUNTIX
      </span>
    </button>
  );
};
