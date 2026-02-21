import { SystemHealth } from '../types';
import { TrendingUp } from 'lucide-react';

interface SystemHealthPanelProps {
  health: SystemHealth;
}

export function SystemHealthPanel({ health }: SystemHealthPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-600 uppercase text-sm mb-4">System Health</h3>
        
        <div className="space-y-4">
          {/* API Latency */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">API Latency</span>
              <span className="text-sm font-bold text-green-600">{health.apiStatus}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: '85%' }}
              />
            </div>
          </div>

          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Storage Usage</span>
              <span className="text-sm font-bold text-blue-600">{health.storagePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${health.storagePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Volume */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm text-gray-400 uppercase">Weekly Volume</h3>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="text-4xl font-bold mb-2">1,284</div>
        <div className="flex items-center gap-1 text-sm text-green-400">
          <span>↗</span>
          <span>+12% vs last week</span>
        </div>
      </div>
    </div>
  );
}
