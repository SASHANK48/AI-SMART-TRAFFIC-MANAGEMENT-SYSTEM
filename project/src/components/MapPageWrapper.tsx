import React from 'react';
import { MapPage } from '../pages/MapPage';
import { useTrafficData } from '../hooks/useTrafficData';
import { useTheme } from '../contexts/ThemeContext';

export const MapPageWrapper: React.FC = () => {
  const trafficData = useTrafficData();
  const { theme } = useTheme();
  
  return <MapPage data={trafficData} isDarkMode={theme === 'dark'} />;
};
