import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';
import { getUserLocation } from '../utils/geolocation';

export default function DeliveryZoneMap({ restaurant }) {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  };

  const openInGoogleMaps = () => {
    if (restaurant?.latitude && restaurant?.longitude) {
      const url = `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=15`;
      window.open(url, '_blank');
    }
  };

  const getDirections = () => {
    if (restaurant?.latitude && restaurant?.longitude && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${restaurant.latitude},${restaurant.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!restaurant?.latitude || !restaurant?.longitude) {
    return null;
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${restaurant.latitude},${restaurant.longitude}&zoom=14&maptype=satellite`;
  
  // Fallback to OpenStreetMap if no Google Maps API key
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.longitude - 0.01},${restaurant.latitude - 0.01},${restaurant.longitude + 0.01},${restaurant.latitude + 0.01}&layer=mapnik&marker=${restaurant.latitude},${restaurant.longitude}`;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Delivery Zone Map
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openInGoogleMaps}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Open in Google Maps"
            >
              <MapPin size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            {userLocation && (
              <button
                onClick={getDirections}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Get Directions"
              >
                <Navigation size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {restaurant.deliveryRadiusKm && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Delivery radius: <span className="font-medium text-primary">{restaurant.deliveryRadiusKm} km</span>
          </p>
        )}
      </div>

      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-64 sm:h-80'}`}>
        <iframe
          ref={mapRef}
          src={osmUrl}
          className="w-full h-full border-0"
          loading="lazy"
          title="Restaurant Location Map"
        />
        
        {/* Overlay with restaurant info */}
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {restaurant.name}
              </p>
              {restaurant.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {restaurant.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            📍 Lat: {restaurant.latitude.toFixed(6)}, Lng: {restaurant.longitude.toFixed(6)}
          </span>
          <button
            onClick={openInGoogleMaps}
            className="text-primary hover:underline font-medium"
          >
            View on Google Maps →
          </button>
        </div>
      </div>
    </div>
  );
}
