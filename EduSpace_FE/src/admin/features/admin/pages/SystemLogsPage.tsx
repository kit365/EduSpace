import { AdminLayout } from "../../../layouts/AdminLayout";
import { useLogs } from '../hooks/useAdmin';
import { Activity, Search } from 'lucide-react';

export function SystemLogsPage() {
    const {
        logs,
        loading,
        error,
        page,
        totalElements,
        totalPages,
        search,
        eventType,
        status,
        setPage,
        setSearch,
        setEventType,
        setStatus
    } = useLogs();

    return (
        <AdminLayout title="System Logs">
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4 items-center">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Audit Trail</h2>
                    <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">{totalElements} Entries</span>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        className="pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-bold w-full placeholder:text-gray-300"
                        placeholder="Filter logs..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <select
                    value={eventType}
                    onChange={(e) => {
                        setEventType(e.target.value);
                        setPage(0);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                    <option value="">All events</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="REGISTER">REGISTER</option>
                    <option value="VERIFY_EMAIL">VERIFY_EMAIL</option>
                    <option value="REFRESH_TOKEN">REFRESH_TOKEN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="CHANGE_PASSWORD">CHANGE_PASSWORD</option>
                    <option value="SETUP_2FA">SETUP_2FA</option>
                    <option value="ENABLE_2FA">ENABLE_2FA</option>
                    <option value="DISABLE_2FA">DISABLE_2FA</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILURE">FAILURE</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <p className="text-center text-gray-400 font-bold py-10">Searching logs...</p>
                ) : error ? (
                    <p className="text-center text-red-500 font-bold py-10">{error}</p>
                ) : logs.length === 0 ? (
                    <p className="text-center text-gray-400 font-bold py-10">No logs found</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${log.status === 'Success' ? 'bg-green-50 text-green-500' :
                                    log.status === 'Failed' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                                    }`}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-1">{log.action}</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        User: <span className="text-gray-600">{log.user}</span>
                                    </p>
                                    {log.eventType ? <p className="text-xs text-gray-400 mt-1">Event: {log.eventType}</p> : null}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 ${log.status === 'Success' ? 'bg-green-100 text-green-700' :
                                    log.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {log.status}
                                </div>
                                <p className="text-xs font-bold text-gray-300">{log.time ? new Date(log.time).toLocaleString() : '-'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
                <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page <= 0 || loading}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-500">Page {totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
                <button
                    onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                    disabled={loading || totalPages === 0 || page + 1 >= totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </AdminLayout>
    );
}
