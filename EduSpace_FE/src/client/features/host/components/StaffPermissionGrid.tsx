import { staffOperationalCatalog } from '../permissions/staffOperationalCatalog';

type Props = {
    isVi: boolean;
    selectedKeys: Set<string>;
    onToggle: (permissionKey: string, checked: boolean) => void;
    disabled?: boolean;
};

export function StaffPermissionGrid({ isVi, selectedKeys, onToggle, disabled }: Props) {
    return (
        <div className="mt-4 space-y-6 border-t border-gray-100 pt-4">
            {staffOperationalCatalog.map((group) => (
                <div key={group.id}>
                    <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                        {isVi ? group.titleVi : group.titleEn}
                    </h5>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {group.items.map((item) => {
                            const checked = selectedKeys.has(item.key);
                            return (
                                <label
                                    key={item.key}
                                    className={`flex cursor-pointer gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 transition hover:bg-gray-50 ${
                                        disabled ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-red-500 focus:ring-red-500"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={(e) => onToggle(item.key, e.target.checked)}
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-bold text-gray-900">
                                            {isVi ? item.labelVi : item.labelEn}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500 leading-snug">
                                            {isVi ? item.descriptionVi : item.descriptionEn}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
