import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

const popularDestinations = [
  { position: { lat: 48.8566, lng: 2.3522 }, name: 'Paris', color: '#a855f7' },
  { position: { lat: 35.6762, lng: 139.6503 }, name: 'Tokyo', color: '#3b82f6' },
  { position: { lat: 40.7128, lng: -74.0060 }, name: 'New York', color: '#06b6d4' },
  { position: { lat: -33.8688, lng: 151.2093 }, name: 'Sydney', color: '#8b5cf6' },
  { position: { lat: 51.5074, lng: -0.1278 }, name: 'London', color: '#a855f7' },
];

export const HeroMap = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <p className="text-muted-foreground">Map visualization coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.4)]">
        <Map
          mapId="hero-map"
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={2}
          gestureHandling="cooperative"
          disableDefaultUI={true}
          styles={[
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#1a1625' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0f0a1a' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#1a1625' }],
            },
          ]}
        >
          {popularDestinations.map((destination, index) => (
            <AdvancedMarker
              key={index}
              position={destination.position}
              title={destination.name}
            >
              <Pin
                background={destination.color}
                glyphColor="#ffffff"
                borderColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};
