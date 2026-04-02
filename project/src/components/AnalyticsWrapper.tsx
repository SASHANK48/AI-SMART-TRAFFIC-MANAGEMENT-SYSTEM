import React from 'react';
import { Analytics } from '../pages/Analytics';
import { useTrafficData } from '../hooks/useTrafficData';
import { useTheme } from '../contexts/ThemeContext';

export const AnalyticsWrapper: React.FC = () => {
  const trafficData = useTrafficData();
  const { theme } = useTheme();
  
  return <Analytics data={trafficData} isDarkMode={theme === 'dark'} />;
};
