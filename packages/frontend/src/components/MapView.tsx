import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { Property } from "../../../../types/Property";

interface MapViewProps {
  properties: Property[];
}

export default function MapView({ properties = [] }: MapViewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => ({ lat: 34.0736, lng: -118.4004 }), []);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const handleMarkerClick = (property: Property): void => {
    setActiveMarker(property.id);
  };

  const handleInfoWindowClose = (): void => {
    setActiveMarker(null);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerStyle={{ width: "100%", height: "100vh" }}
    >
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={{ lat: property.lat, lng: property.lng }}
          onClick={() => handleMarkerClick(property)}
        >
          {activeMarker === property.id && (
            <InfoWindow onCloseClick={handleInfoWindowClose}>
              <div style={{ padding: '8px', maxWidth: '200px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px', color: '#333' }}>
                    {property.name}
                  </strong>
                </div>
                <div style={{ marginBottom: '8px', fontSize: '16px', color: '#2E7D32', fontWeight: 'bold' }}>
                  {formatPrice(property.price)}
                </div>
                <div>
                  <img
                    src={property.image || 'https://via.placeholder.com/100x60'}
                    alt={property.name}
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100x60';
                    }}
                  />
                </div>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
