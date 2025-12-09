import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Loader } from 'lucide-react';
import { checkDeliveryAvailability } from '../utils/geolocation';

/**
 * Guard component that checks if user is in delivery zone
 * Wraps children and shows/hides based on delivery availability
 */
export default function DeliveryZoneGuard({ restaurant, children, fallback }) {
  const [checking, setChecking] = useState(true);
  const [isInZone, setIsInZone] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    checkZone();
  }, [restaurant?.id]);

  const checkZone = async () => {
    // If restaurant doesn't have location configured, allow ordering
    if (!restaurant?.latitude || !restaurant?.longitude) {
      setIsInZone(true);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const checkResult = await checkDeliveryAvailability(restaurant);
      setResult(checkResult);
      setIsInZone(checkResult.allowed);
    } catch (error) {
      console.error('Delivery zone check failed:', error);
      setIsInZone(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-3 text-primary" size={32} />
          <p className="text-gray-600 dark:text-gray-400">
            Checking delivery availability...
          </p>
        </div>
      </div>
    );
  }

  if (!isInZone) {
    if (fallback) {
      return fallback(result);
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-300 text-lg mb-2">
              Outside Delivery Zone
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-3">
              Sorry, we don't deliver to your location yet.
            </p>
            {result?.distance && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                You are approximately <strong>{result.distance} km</strong> away.
                {restaurant.deliveryRadiusKm && (
                  <> Our delivery radius is <strong>{restaurant.deliveryRadiusKm} km</strong>.</>
                )}
              </p>
            )}
            {result?.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                {result.error}
              </p>
            )}
            <button
              onClick={checkZone}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
