import { Users, Home, Shield } from 'lucide-react';

export type UserRole = 'user' | 'host' | 'admin';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  /** Tab được phép hiển thị (phân quyền) — luôn gồm 'user' nếu có switcher */
  allowedModes: UserRole[];
}

const ALL_MODES: { id: UserRole; label: string; icon: typeof Users }[] = [
  { id: 'user', label: 'User Mode', icon: Home },
  { id: 'host', label: 'Host Console', icon: Users },
  { id: 'admin', label: 'Admin Portal', icon: Shield },
];

export function RoleSwitcher({ currentRole, onRoleChange, allowedModes }: RoleSwitcherProps) {
  const roles = ALL_MODES.filter((r) => allowedModes.includes(r.id));

  if (roles.length <= 1) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-2xl">
      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
              currentRole === role.id
                ? 'bg-red-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={role.label}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden text-sm font-semibold md:inline">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}
