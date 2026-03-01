import { Radio, LayoutDashboard, Map as MapIcon, BarChart2, Bell } from 'lucide-react';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    cameraCount: number;
    activeAlerts: number;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
];

export function Navbar({ activePage, onNavigate, cameraCount, activeAlerts }: NavbarProps) {
    return (
        <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                            <Radio className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Smart Traffic Management</h1>
                            <p className="text-xs text-gray-500">AI-Powered Real-Time Traffic Control</p>
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
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
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

                    {/* Status + Clock */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-green-700">System Online</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Cameras</p>
                            <p className="text-sm font-bold text-gray-900">{cameraCount} Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
