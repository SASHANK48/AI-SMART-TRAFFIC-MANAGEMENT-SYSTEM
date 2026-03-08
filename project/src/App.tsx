import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MapPage } from './pages/MapPage';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { useTrafficData } from './hooks/useTrafficData';

import { EmergencyResponse } from './pages/EmergencyResponse';
import { TrafficPredictions } from './pages/TrafficPredictions';

type Page = 'dashboard' | 'map' | 'analytics' | 'alerts' | 'emergency' | 'predictions';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const trafficData = useTrafficData();

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard data={trafficData} isDarkMode={isDarkMode} />;
      case 'map': return <MapPage data={trafficData} isDarkMode={isDarkMode} />;
      case 'analytics': return <Analytics data={trafficData} isDarkMode={isDarkMode} />;
      case 'alerts': return <Alerts data={trafficData} isDarkMode={isDarkMode} />;
      case 'emergency': return <EmergencyResponse data={trafficData} isDarkMode={isDarkMode} />;
      case 'predictions': return <TrafficPredictions data={trafficData} isDarkMode={isDarkMode} />;
      default: return <Dashboard data={trafficData} isDarkMode={isDarkMode} />;
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900'}`}>
      <Navbar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
        cameraCount={trafficData.cameras.length}
        activeAlerts={trafficData.activeAlerts}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {renderPage()}
    </div>
  );
}

export default App;
