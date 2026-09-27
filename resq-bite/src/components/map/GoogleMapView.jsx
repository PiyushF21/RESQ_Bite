import React, { useMemo } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import LoadingSpinner from '../ui/LoadingSpinner';
import { MapPin } from 'lucide-react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../constants';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

export default function GoogleMapView({ listings = [], variant = 'student', label = 'Live Map' }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const { position: geoPosition } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = React.useState(null);

  const center = useMemo(() => {
    if (geoPosition) return geoPosition;
    if (listings.length > 0 && listings[0].lat && listings[0].lng) {
      return { lat: parseFloat(listings[0].lat), lng: parseFloat(listings[0].lng) };
    }
    return DEFAULT_CENTER;
  }, [geoPosition, listings]);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
  };

  const groupedListings = useMemo(() => {
    const groups = {};
    listings.forEach(listing => {
      const id = listing.restaurant_id || listing.id;
      if (!groups[id]) {
        groups[id] = { ...listing, count: 1 };
      } else {
        groups[id].count += 1;
      }
    });
    return Object.values(groups);
  }, [listings]);

  if (!apiKey) {
    return (
      <div className="h-72 rounded-2xl border border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-stone-500 relative">
        <MapPin className="w-12 h-12 mb-4 text-stone-400" />
        <p className="font-medium text-sm">Add VITE_GOOGLE_MAPS_API_KEY to .env to enable maps</p>
      </div>
    );
  }

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div className="h-72 rounded-2xl border flex items-center justify-center"><LoadingSpinner /></div>;

  const isNGO = variant === 'ngo';
  const dotColor = isNGO ? 'bg-indigo-500' : 'bg-emerald-500';

  return (
    <div className="h-72 rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative">
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-stone-200 flex items-center gap-2 font-bold text-sm text-stone-900">
        <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
        {label}
      </div>
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={DEFAULT_ZOOM}
        center={center}
        options={mapOptions}
      >
        {groupedListings.map((group) => {
          if (!group.lat || !group.lng) return null;
          return (
            <MarkerF
              key={group.id}
              position={{ lat: parseFloat(group.lat), lng: parseFloat(group.lng) }}
              onClick={() => setSelectedMarker(group)}
            />
          );
        })}

        {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
          <InfoWindowF
            position={{ lat: parseFloat(selectedMarker.lat), lng: parseFloat(selectedMarker.lng) }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-bold text-stone-900">{selectedMarker.business_name}</h3>
              <p className="text-sm text-stone-500">{selectedMarker.count} item(s) available</p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
