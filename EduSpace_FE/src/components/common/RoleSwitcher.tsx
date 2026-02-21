import { Users, Home, Shield } from 'lucide-react';

export type UserRole = 'user' | 'host' | 'admin';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const roles: { id: UserRole; label: string; icon: typeof Users }[] = [
    { id: 'user', label: 'User Mode', icon: Home },
    { id: 'host', label: 'Host Console', icon: Users },
    { id: 'admin', label: 'Admin Portal', icon: Shield }
  ];

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex gap-2 z-50">
      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              currentRole === role.id
                ? 'bg-red-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={role.label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}
