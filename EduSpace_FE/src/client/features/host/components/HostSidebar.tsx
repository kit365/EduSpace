import { LayoutGrid, List, Calendar, DollarSign, Star, Settings } from 'lucide-react';

interface HostSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function HostSidebar({ activeSection, onSectionChange }: HostSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'listings', label: 'Listings', icon: List },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star }
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">EduSpace</div>
            <div className="text-xs text-red-500 font-semibold">HOST CONSOLE</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                activeSection === item.id
                  ? 'bg-red-50 text-red-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Host Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            NM
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Nguyen Minh</div>
            <div className="text-xs text-gray-500">Premium Host</div>
          </div>
        </div>
      </div>
    </div>
  );
}
