import { Permission } from '@/types';
import { getPermissionDisplayDescription, getPermissionDisplayName, getPermissionGroupDisplayName } from '@/admin/features/user-management/utils/permissionDisplayI18n';

type Props = {
    isVi: boolean;
    permissionCatalog: Permission[];
    permissionNames: string[];
};

function groupPermissions(perms: Permission[]): Record<string, Permission[]> {
    return perms.reduce((acc, p) => {
        const group = p.groupName ?? 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);
}

export function ManagerPermissionsView({ isVi, permissionCatalog, permissionNames }: Props) {
    const set = new Set((permissionNames ?? []).map((n) => (n ?? '').trim().toLowerCase()).filter(Boolean));

    const visible = (permissionCatalog ?? []).filter((p) => set.has((p.name ?? '').trim().toLowerCase()));
    const groups = groupPermissions(visible);

    const entries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));

    if (entries.length === 0) {
        return (
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                {isVi ? 'Chưa có quyền nào được gán cho Manager.' : 'No permissions assigned to Manager.'}
            </p>
        );
    }

    return (
        <div className="mt-3 space-y-4">
            {entries.map(([groupName, perms]) => (
                <div key={groupName} className="border-t border-gray-100 pt-4">
                    <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                        {getPermissionGroupDisplayName(groupName, isVi ? 'vi' : 'en')}
                    </h5>
                    <ul className="space-y-2">
                        {perms
                            .slice()
                            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                            .map((perm) => {
                                const desc = getPermissionDisplayDescription(
                                    perm.name,
                                    perm.description ?? '',
                                    isVi ? 'vi' : 'en',
                                );
                                return (
                                    <li key={perm.id} className="flex items-start gap-2 text-xs">
                                        <span className="mt-0.5 inline-flex w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900">{getPermissionDisplayName(perm.name, isVi ? 'vi' : 'en')}</div>
                                            {desc ? <div className="text-gray-500 leading-snug">{desc}</div> : null}
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

