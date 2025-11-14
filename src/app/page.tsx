'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface RoutePoint {
  address: Address;
  distance: number;
  duration: number;
  order: number;
}

export default function Home() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    fetchAddresses();
    getUserLocation();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to map center
          setUserLocation([
            parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || '49.2827'),
            parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || '-123.1207')
          ]);
        }
      );
    }
  };

  const findRoute = async () => {
    if (!userLocation) {
      alert('Unable to get your location');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Find nearest addresses
      const nearestRes = await fetch('/api/routes/nearest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userLocation[0],
          longitude: userLocation[1],
          limit
        })
      });
      const nearest = await nearestRes.json();

      if (nearest.length === 0) {
        alert('No addresses found nearby');
        return;
      }

      // Step 2: Optimize route
      const optimizeRes = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { lat: userLocation[0], lng: userLocation[1] },
          addressIds: nearest.map((a: Address) => a.id)
        })
      });
      const optimized = await optimizeRes.json();

      setRoute(optimized.route);
    } catch (error) {
      console.error('Error finding route:', error);
      alert('Error calculating route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Route Optimizer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Find Route</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Stops
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                onClick={findRoute}
                disabled={loading || !userLocation}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Find Optimal Route'}
              </button>

              {userLocation && (
                <p className="text-sm text-gray-600">
                  Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              )}
            </div>

            {/* Route Details */}
            {route.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-3">Route Details</h3>
                <div className="space-y-2">
                  {route.map((point, idx) => (
                    <div key={point.address.id} className="text-sm border-l-4 border-blue-500 pl-3 py-2">
                      <div className="font-medium">
                        {idx + 1}. {point.address.name}
                      </div>
                      <div className="text-gray-600">
                        {point.address.street}, {point.address.city}
                      </div>
                      <div className="text-gray-500">
                        {(point.distance / 1000).toFixed(1)} km • {Math.round(point.duration / 60)} min
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Distance:</span>
                    <span>{(route.reduce((sum, p) => sum + p.distance, 0) / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Time:</span>
                    <span>{Math.round(route.reduce((sum, p) => sum + p.duration, 0) / 60)} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div style={{ height: '600px' }}>
              <RouteMap
                userLocation={userLocation}
                addresses={addresses}
                route={route}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">{addresses.length}</div>
            <div className="text-gray-600">Total Addresses</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">{route.length}</div>
            <div className="text-gray-600">Stops in Route</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">
              {route.length > 0 ? (route.reduce((sum, p) => sum + p.distance, 0) / 1000).toFixed(0) : '0'}
            </div>
            <div className="text-gray-600">Total km</div>
          </div>
        </div>
      </div>
    </main>
  );
}
