import React from 'react';
import { Zap } from 'lucide-react';

const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Lightning Symbol */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
        <Zap className="w-5 h-5" fill="currentColor" />
      </div>

      {/* Text */}
      <span className="text-xl font-bold tracking-tight text-text-primary dark:text-white">
        Ka<span className="text-primary">s</span>ya
      </span>
    </div>
  );
};

export default Logo;
