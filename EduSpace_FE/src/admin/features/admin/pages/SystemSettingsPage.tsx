import { AdminLayout } from "../../../layouts/AdminLayout";
import { Settings, ToggleLeft, ToggleRight, Save, RotateCw } from 'lucide-react';

export function SystemSettingsPage() {
    return (
        <AdminLayout title="System Settings">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-4xl">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configuration Center</h2>
                        <p className="text-gray-400 font-bold">Manage core system parameters.</p>
                    </div>
                </div>

                <div className="space-y-10 divide-y divide-gray-100">
                    {/* Maintenance Mode */}
                    <div className="pt-2">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Maintenance Mode</h3>
                                <p className="text-sm font-medium text-gray-400 max-w-md">
                                    When enabled, the user-facing application will show a maintenance page. Admin panel remains accessible.
                                </p>
                            </div>
                            <button className="text-gray-300 hover:text-green-500 transition-colors">
                                <ToggleLeft className="w-12 h-12" />
                            </button>
                        </div>
                    </div>

                    {/* Booking Rules */}
                    <div className="pt-10">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <RotateCw className="w-5 h-5 text-blue-500" /> Booking Rules
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Booking Timeout (Minutes)</label>
                                <input
                                    type="number"
                                    defaultValue={15}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Default: 15 mins</p>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Max Advance Booking (Days)</label>
                                <input
                                    type="number"
                                    defaultValue={30}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Points System */}
                    <div className="pt-10">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <RotateCw className="w-5 h-5 text-amber-500" /> Loyalty Points
                        </h3>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Conversion Rate (Points to VNĐ)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">1 Point =</span>
                                <input
                                    type="number"
                                    defaultValue={100}
                                    className="w-full pl-24 p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">VNĐ</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex justify-end">
                        <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg active:scale-95">
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
