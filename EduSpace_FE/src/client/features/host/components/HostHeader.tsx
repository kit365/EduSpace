import { Search, Bell, HelpCircle } from 'lucide-react';

interface HostHeaderProps {
  title: string;
}

export function HostHeader({ title }: HostHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500 w-64"
            />
          </div>

          {/* Help */}
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
