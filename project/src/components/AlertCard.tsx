import { AlertTriangle, Car, Construction, X } from 'lucide-react';
import type { TrafficAlert } from '../types/traffic';

interface AlertCardProps {
  alert: TrafficAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-300 text-red-900';
      case 'high': return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'medium': return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      default: return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'accident': return Construction;
      case 'emergency': return AlertTriangle;
      default: return Car;
    }
  };

  const Icon = getIcon(alert.alert_type);
  const timeAgo = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 60000);

  return (
    <div className={`rounded-lg border-2 p-4 ${getSeverityStyles(alert.severity)} ${alert.resolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          alert.severity === 'critical' ? 'bg-red-100' :
          alert.severity === 'high' ? 'bg-orange-100' :
          alert.severity === 'medium' ? 'bg-yellow-100' :
          'bg-blue-100'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold capitalize">{alert.alert_type} Alert</h4>
              <p className="text-sm mt-1">{alert.message}</p>
              <p className="text-xs mt-2 opacity-75">{timeAgo} min ago</p>
            </div>
            {alert.resolved && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <X className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
