import { useState } from 'react';
import { RentalLayout } from "../../../layouts/RentalLayout";
import { CALENDAR_EVENTS } from '../data/mockData';
import { useBranch } from '../context/BranchContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';

export function CalendarPage() {
    const { selectedBranch } = useBranch();
    const [view, setView] = useState<'month' | 'week' | 'day'>('week');

    const filteredEvents = selectedBranch
        ? CALENDAR_EVENTS.filter(e => e.branchId === selectedBranch.id)
        : CALENDAR_EVENTS;

    return (
        <RentalLayout title="Calendar Management">
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Calendar</h1>
                        <p className="text-gray-500 font-medium">Manage your spaces' availability and view upcoming bookings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm flex font-bold text-sm">
                            <button onClick={() => setView('month')} className={`px-4 py-2 rounded-lg transition-all ${view === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Month</button>
                            <button onClick={() => setView('week')} className={`px-4 py-2 rounded-lg transition-all ${view === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Week</button>
                            <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg transition-all ${view === 'day' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Day</button>
                        </div>
                        <button className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md">
                            <Plus className="w-4 h-4" /> Add Event
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                    {/* Calendar Header Tools */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                            <h2 className="text-lg font-black text-gray-900 select-none">December 2024</h2>
                            <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                            <button className="px-4 py-2 bg-white text-sm font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 ml-2 shadow-sm transition-all">Today</button>
                        </div>
                    </div>

                    {/* Timeline List View Fake */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="grid grid-cols-7 gap-px bg-gray-100 min-h-full">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                <div key={day} className="bg-white min-h-[150px] p-3 flex flex-col">
                                    <div className={`text-sm font-bold mb-3 ${i === 3 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {day} <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full ml-1 ${i === 3 ? 'bg-red-50 text-red-600' : 'text-gray-900'}`}>{15 + i}</span>
                                    </div>

                                    {/* Map fake events locally for this visual mockup */}
                                    {filteredEvents.map(evt => {
                                        // Randomly assign to a day visually based on event id for mockup
                                        if (evt.id % 7 !== i) return null;
                                        return (
                                            <div key={evt.id} className={`p-2.5 rounded-xl text-xs font-bold mb-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${evt.type === 'booking' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' : 'bg-green-50 text-green-700 border border-green-200/50'}`}>
                                                <div className="truncate mb-1 leading-tight">{evt.title}</div>
                                                <div className="flex items-center gap-1 font-medium opacity-80 mt-1">
                                                    <Clock className="w-3 h-3" /> {evt.startTime} - {evt.endTime}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
