import { RentalLayout } from "../../../layouts/RentalLayout";

export function CalendarPage() {
    return (
        <RentalLayout title="Calendar Management">
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Calendar</h1>
                    <p className="text-gray-500 font-medium">Manage availability and blocks here.</p>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[500px] flex items-center justify-center text-gray-400">
                    Calendar Component Placeholder
                </div>
            </div>
        </RentalLayout>
    );
}
