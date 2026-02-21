import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarManagementProps {
  events: CalendarEvent[];
}

export function CalendarManagement({ events }: CalendarManagementProps) {
  const [currentMonth] = useState('October 2023');

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Generate calendar grid
  const calendarDays = [
    { day: 25, events: [] },
    { day: 26, events: [{ title: 'Lab 204 Bo...', color: 'bg-red-500' }] },
    { day: 27, events: [{ title: 'Seminar A ...', color: 'bg-orange-500' }] },
    { day: 28, events: [{ title: 'Seminar B', color: 'bg-orange-500' }] },
    { day: 29, events: [] },
    { day: 30, events: [{ title: 'Workshop ...', color: 'bg-blue-500' }] },
    { day: 1, events: [{ title: 'Fully Booked', color: 'bg-red-500' }] },
    { day: 2, events: [] },
    { day: 3, events: [] },
    { day: 4, events: [] },
    { day: 5, events: [] },
    { day: 6, events: [] },
    { day: 7, events: [] },
    { day: 8, events: [] },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Calendar Management</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold">{currentMonth}</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            className="min-h-[80px] p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="text-sm font-semibold text-gray-700 mb-1">{dayData.day}</div>
            <div className="space-y-1">
              {dayData.events.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={`${event.color} text-white text-xs px-2 py-1 rounded truncate`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
