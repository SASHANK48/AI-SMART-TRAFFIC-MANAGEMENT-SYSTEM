import { Radio, LayoutDashboard, Map as MapIcon, BarChart2, Bell, Moon, Sun, Ambulance, BrainCircuit } from 'lucide-react';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    cameraCount: number;
    activeAlerts: number;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'emergency', label: 'Emergency', icon: Ambulance },
    { id: 'predictions', label: 'AI Forecast', icon: BrainCircuit },
    { id: 'alerts', label: 'Alerts', icon: Bell },
];

export function Navbar({ activePage, onNavigate, cameraCount, activeAlerts, isDarkMode, toggleDarkMode }: NavbarProps) {
    return (
        <header className={`sticky top-0 z-50 transition-colors duration-300 pointer-events-none py-4 px-6`}>
            <div className={`max-w-[1600px] mx-auto pointer-events-auto rounded-2xl shadow-lg border backdrop-blur-md px-6 py-3 flex items-center justify-between ${
                isDarkMode 
                ? 'bg-gray-900/80 border-gray-700 shadow-black/20 text-white' 
                : 'bg-white/80 border-gray-200 shadow-gray-200/50 text-gray-900'
            }`}>
                <div className="flex items-center justify-between w-full">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                            <Radio className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight leading-tight">Flow AI</h1>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Anti-Gravity Traffic Core</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex items-center gap-1">
                        {navItems.map(({ id, label, icon: Icon }) => {
                            const isActive = activePage === id;
                            const showBadge = id === 'alerts' && activeAlerts > 0;
                            return (
                                <button
                                    key={id}
                                    onClick={() => onNavigate(id)}
                                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : isDarkMode 
                                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    {showBadge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {activeAlerts > 9 ? '9+' : activeAlerts}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Status + Clock + Dark Mode */}
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                            isDarkMode ? 'bg-green-900/30 border-green-800/50' : 'bg-green-50 border-green-200'
                        }`}>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>System Online</span>
                        </div>
                        
                        <div className="text-right hidden sm:block">
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cameras</p>
                            <p className="text-sm font-bold">{cameraCount} Active</p>
                        </div>

                        {/* Theme Toggle Button */}
                        <div className={`w-px h-8 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-xl transition-all ${
                                isDarkMode 
                                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
