import { useNavigate } from "react-router-dom";
import { RentalLayout } from "../../../layouts/RentalLayout";

export function SpacesPage() {
    const navigate = useNavigate();
    return (
        <RentalLayout title="My Spaces">
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Spaces</h1>
                        <p className="text-gray-500 font-medium">Manage your listed venues and rooms.</p>
                    </div>
                    <button
                        onClick={() => navigate('/rental/spaces/new')}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
                    >
                        Add New Space
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for space cards */}
                    <div className="border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer bg-white group">
                        <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-all" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">Example Space</h3>
                        <p className="text-sm font-medium text-green-500 bg-green-50 px-3 py-1 rounded-full w-fit">Active</p>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
