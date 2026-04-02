import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconSize = 24, showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
        <Activity size={iconSize} className="text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-gray-900 dark:text-white">Smart</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 -mt-1 tracking-wider uppercase">Traffic</span>
        </div>
      )}
    </div>
  );
};
