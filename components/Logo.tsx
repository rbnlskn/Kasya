
import React from 'react';

const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Lightning Symbol */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-warning dark:text-warning"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Text */}
      <span className="text-xl font-bold tracking-tight text-text-primary dark:text-white">
        Ka<span className="text-warning">s</span>ya
      </span>
    </div>
  );
};

export default Logo;
