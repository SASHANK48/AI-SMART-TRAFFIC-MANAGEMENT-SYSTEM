import React from 'react';
import { Dashboard } from '../pages/Dashboard';
import { useTrafficData } from '../hooks/useTrafficData';
import { useTheme } from '../contexts/ThemeContext';

export const DashboardWrapper: React.FC = () => {
  const trafficData = useTrafficData();
  const { theme } = useTheme();
  
  return <Dashboard data={trafficData} isDarkMode={theme === 'dark'} />;
};
