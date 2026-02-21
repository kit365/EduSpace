import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CalendarRange, CheckCircle2, XCircle, LibraryBig } from 'lucide-react';
import { BookingCard, BookingFilters as BookingFiltersComp } from '../components';
import { BookingFilters as BookingFiltersType } from '../types';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { useBookings } from '../hooks/useBookings';

export function BookingsPage() {
  const navigate = useNavigate();
  const { bookings, loading, cancelBooking } = useBookings();
  const [filters, setFilters] = useState<BookingFiltersType>({
    status: 'all',
    sortBy: 'date'
  });

  const onBack = () => navigate(-1);

  // Filter bookings based on status
  const filteredBookings = bookings.filter((booking) => {
    if (filters.status === 'all') return true;
    return booking.status === filters.status;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (filters.sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'price':
        return b.totalPrice - a.totalPrice;
      case 'name':
        return a.spaceName.localeCompare(b.spaceName);
      default:
        return 0;
    }
  });

  const handleViewDetails = (id: number) => {
    navigate(`/bookings/${id}`);
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn huỷ đặt phòng này không?')) {
      await cancelBooking(id);
    }
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['upcoming', 'confirmed', 'checked_in'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Synchronizing reservations...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-slate-50/50 py-12 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-4">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <button
                onClick={onBack}
                className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest mb-6"
              >
                <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                Portal Return
              </button>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">Reservations</h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg">Track your upcoming educational sessions and historical bookings at a glance.</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white px-6 py-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Total</div>
                  <div className="text-xl font-black text-gray-900">{stats.total}</div>
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Active</div>
                  <div className="text-xl font-black text-gray-900">{stats.active}</div>
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Cancelled</div>
                  <div className="text-xl font-black text-gray-900">{stats.cancelled}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">

                <div className="bg-gray-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <LibraryBig className="w-12 h-12 text-red-500 mb-6 relative z-10" />
                  <h3 className="text-xl font-black mb-2 relative z-10">Need more space?</h3>
                  <p className="text-sm font-bold text-gray-400 mb-8 relative z-10">Discover new specialized classrooms and training halls for your next session.</p>
                  <button
                    onClick={() => navigate('/search')}
                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    Browse Catalog
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="sticky top-24 z-30">
                  <BookingFiltersComp filters={filters} onFiltersChange={setFilters} />
                </div>
                {sortedBookings.length > 0 ? (
                  sortedBookings.map((booking) => (
                    <div className="animate-in slide-in-from-bottom-4 duration-500" key={booking.id}>
                      <BookingCard
                        booking={booking}
                        onViewDetails={handleViewDetails}
                        onCancel={handleCancel}
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-24 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white">
                      <CalendarRange className="w-12 h-12 text-gray-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No match found</h2>
                    <p className="text-gray-400 mb-12 max-w-sm mx-auto font-bold">Try adjusting your filters or browse our catalog of premium educational spaces.</p>
                    <button
                      onClick={() => navigate('/search')}
                      className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-red-500 transition-all shadow-2xl active:scale-95"
                    >
                      Explore Spaces
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
