import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color: 'blue' | 'green' | 'orange' | 'red';
  isDarkMode: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, color, isDarkMode }: StatsCardProps) {
  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  const bgStyles = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
  };

  return (
    <div className={`rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`${isDarkMode ? 'bg-gray-700/50' : bgStyles[color]} p-3 rounded-xl shadow-inner`}>
          <Icon className={`w-6 h-6 ${isDarkMode ? 'text-white opacity-90' : colorStyles[color]+' text-white'} rounded-lg p-1`} />
        </div>
      </div>
    </div>
  );
}
