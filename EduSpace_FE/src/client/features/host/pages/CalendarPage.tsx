import { useCallback, useEffect, useMemo, useState } from 'react';
import { RentalLayout } from "../../../layouts/RentalLayout";
import { useBranch } from '../context/BranchContext';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useProfile } from '@/client/features/customer/profile/hooks/useProfile';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomDto } from '@/client/features/room/types';
import { hostBookingService, type HostBookingDto } from '../services/hostBookingService';

type HostCalendarEvent = {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    dateKey: string;
    roomId: number;
};

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatHm(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function CalendarPage() {
    const { selectedBranch } = useBranch();
    const { profile } = useProfile();
    const [view, setView] = useState<'month' | 'week' | 'day'>('week');
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [bookings, setBookings] = useState<HostBookingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCalendarData = useCallback(async () => {
        const ownerId = profile?.id?.trim();
        if (!ownerId) {
            setRooms([]);
            setBookings([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [hostRooms, allBookings] = await Promise.all([
                roomApiService.getAll({ ownerId }),
                hostBookingService.getAll(),
            ]);
            setRooms(hostRooms);
            setBookings(allBookings);
        } catch {
            setError('Không tải được lịch đặt phòng. Vui lòng thử lại.');
            setRooms([]);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        void loadCalendarData();
    }, [loadCalendarData]);

    const roomById = useMemo(() => {
        return new Map(rooms.map((room) => [room.id, room] as const));
    }, [rooms]);

    const visibleRoomIds = useMemo(() => {
        const filtered = selectedBranch
            ? rooms.filter((room) => room.propertyId === selectedBranch.id)
            : rooms;
        return new Set(filtered.map((room) => room.id));
    }, [rooms, selectedBranch]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx));
    }, [weekStart]);

    const weekEventsByDate = useMemo(() => {
        const map = new Map<string, HostCalendarEvent[]>();
        const dayKeys = new Set(weekDays.map(toDateKey));

        for (const booking of bookings) {
            if (!visibleRoomIds.has(booking.roomId)) continue;
            const start = new Date(booking.startDateTime);
            const key = toDateKey(start);
            if (!dayKeys.has(key)) continue;
            const room = roomById.get(booking.roomId);
            const event: HostCalendarEvent = {
                id: booking.id,
                roomId: booking.roomId,
                dateKey: key,
                title: room ? `${room.name} - ${booking.bookingCode}` : `Phòng #${booking.roomId} - ${booking.bookingCode}`,
                startTime: formatHm(booking.startDateTime),
                endTime: formatHm(booking.endDateTime),
            };
            const list = map.get(key) ?? [];
            list.push(event);
            map.set(key, list);
        }

        for (const [, list] of map) {
            list.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return map;
    }, [bookings, roomById, visibleRoomIds, weekDays]);

    const monthYearLabel = useMemo(() => {
        return weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [weekStart]);

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
                            <button
                                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                                className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all text-gray-600"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-black text-gray-900 select-none">{monthYearLabel}</h2>
                            <button
                                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                                className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all text-gray-600"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setWeekStart(startOfWeek(new Date()))}
                                className="px-4 py-2 bg-white text-sm font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 ml-2 shadow-sm transition-all"
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    {/* Timeline List View Fake */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {error ? (
                            <div className="h-full flex items-center justify-center text-sm font-semibold text-red-600">
                                {error}
                            </div>
                        ) : loading ? (
                            <div className="h-full flex items-center justify-center text-sm font-semibold text-gray-500">
                                Đang tải dữ liệu booking...
                            </div>
                        ) : (
                        <div className="grid grid-cols-7 gap-px bg-gray-100 min-h-full">
                            {weekDays.map((date) => (
                                <div key={toDateKey(date)} className="bg-white min-h-[150px] p-3 flex flex-col">
                                    <div className="text-sm font-bold mb-3 text-gray-400">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                                        <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full ml-1 ${toDateKey(date) === toDateKey(new Date()) ? 'bg-red-50 text-red-600' : 'text-gray-900'}`}>
                                            {date.getDate()}
                                        </span>
                                    </div>

                                    {(weekEventsByDate.get(toDateKey(date)) ?? []).map((evt) => {
                                        return (
                                            <div key={evt.id} className="p-2.5 rounded-xl text-xs font-bold mb-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-blue-50 text-blue-700 border border-blue-200/50">
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
                        )}
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
