import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Star, MapPin, Users, Heart, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';
import { useFavorites } from '../hooks/useFavorites';

export function FavoritesPage() {
    const navigate = useNavigate();
    const { favorites, loading, removeFavorite } = useFavorites();

    if (loading) {
        return (
            <CustomerLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">My Favorites</h1>
                        <p className="text-lg text-gray-500">Spaces you've saved for later</p>
                    </div>
                    <div className="text-sm font-black text-red-500 bg-red-50 border border-red-100 px-6 py-2 rounded-2xl shadow-sm">
                        {favorites.length} spaces saved
                    </div>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favorites.map((space) => (
                            <div
                                key={space.id}
                                className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={space.image}
                                        alt={space.name}
                                        onClick={() => navigate(`/spaces/${space.id}`)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 cursor-pointer"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(space.id);
                                        }}
                                        className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <Heart className="w-6 h-6 fill-current" />
                                    </button>
                                    {space.badge && (
                                        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">
                                            {space.badge}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-bold text-gray-400">{space.location}</span>
                                    </div>
                                    <h3
                                        onClick={() => navigate(`/spaces/${space.id}`)}
                                        className="text-xl font-black mb-4 group-hover:text-red-500 transition-colors cursor-pointer leading-tight h-14 line-clamp-2"
                                    >
                                        {space.name}
                                    </h3>

                                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="font-bold">{space.capacity} pax</span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className="font-bold">{space.size} m²</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div>
                                            <span className="text-2xl font-black text-gray-900">
                                                {formatCurrency(space.price)}
                                            </span>
                                            <span className="text-sm text-gray-400 font-bold"> / hr</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span className="font-black text-amber-700">{space.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-24 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Heart className="w-10 h-10 text-red-200" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
                            Explore amazing educational spaces and save your favorites to compare later.
                        </p>
                        <button
                            onClick={() => navigate('/search')}
                            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-500 transition-all shadow-xl active:scale-95"
                        >
                            Browse Spaces
                        </button>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
