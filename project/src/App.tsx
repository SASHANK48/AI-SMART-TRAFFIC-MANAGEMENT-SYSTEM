import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MapPage } from './pages/MapPage';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { useTrafficData } from './hooks/useTrafficData';

type Page = 'dashboard' | 'map' | 'analytics' | 'alerts';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const trafficData = useTrafficData();

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard data={trafficData} />;
      case 'map': return <MapPage data={trafficData} />;
      case 'analytics': return <Analytics data={trafficData} />;
      case 'alerts': return <Alerts data={trafficData} />;
      default: return <Dashboard data={trafficData} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
        cameraCount={trafficData.cameras.length}
        activeAlerts={trafficData.activeAlerts}
      />

      {renderPage()}

      {/* Footer – hidden on map page to maximise map height */}
      {activePage !== 'map' && (
        <footer className="bg-white border-t-2 border-gray-200 mt-12">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                AI-Based Smart Traffic Management System — Hackathon 2024
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{trafficData.cameras.length} Active Cameras</span>
                <span>{trafficData.signals.length} Controlled Signals</span>
                <span>Real-time AI Processing</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
