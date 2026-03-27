import { ActivityLog } from '../types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentActivityPanelProps {
  activities: ActivityLog[];
}

export function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
  const navigate = useNavigate();
  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejection':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flag':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-600 uppercase text-sm">Recent Activity</h3>
        <button className="text-red-500 text-sm hover:text-red-600" onClick={() => navigate('/admin/logs')}>
          View Full Audit Log
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            {getIcon(activity.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-700">{activity.message}</p>
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
