import React from 'react';
import { Alerts } from '../pages/Alerts';
import { useTrafficData } from '../hooks/useTrafficData';
import { useTheme } from '../contexts/ThemeContext';

export const AlertsWrapper: React.FC = () => {
  const trafficData = useTrafficData();
  const { theme } = useTheme();
  
  return <Alerts data={trafficData} isDarkMode={theme === 'dark'} />;
};
