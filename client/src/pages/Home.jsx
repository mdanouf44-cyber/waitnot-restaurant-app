import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { convertNumerals } from '../utils/numberFormatter';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching restaurants...');
      
      const params = {};
      if (searchQuery) params.q = searchQuery;
      
      const { data } = await axios.get('/api/restaurants/search', { params });
      console.log('Restaurants fetched:', data.length);
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError(error.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Connection Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchRestaurants}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Search Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 transition-colors">
          {t('discover')}
        </h1>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant._id}
            to={`/restaurant/${restaurant._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900 transition-all border border-transparent dark:border-gray-700"
          >
            <div className="h-40 sm:h-48 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              {restaurant.image ? (
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl font-bold">{restaurant.name[0]}</span>
              )}
            </div>
            
            <div className="p-3 sm:p-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 transition-colors">{restaurant.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 transition-colors">{restaurant.cuisine?.join(', ')}</p>
              
              <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
                <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                  <Star size={14} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <span className="font-semibold">{convertNumerals(restaurant.rating, i18n.language)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 transition-colors">
                  <Clock size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">
                    {(() => {
                      const time = restaurant.deliveryTime || '30-40 min';
                      const timeWithoutMin = time.replace(/\s*min\s*$/i, '');
                      return `${convertNumerals(timeWithoutMin, i18n.language)} ${t('min')}`;
                    })()}
                  </span>
                </div>
                
                {restaurant.isDeliveryAvailable && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 transition-colors">
                    <MapPin size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delivery</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors">No restaurants found. Try a different search.</p>
        </div>
      )}
      </div>
    </div>
  );
}
