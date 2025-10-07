import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useMemo, useState } from "react";

interface SimplifiedProperty {
  id: string;
  address: string;
  price: number;
  lat: number;
  lng: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  type?: string;
  saleDate?: string;
}

interface MapViewProps {
  zipcode: string;
  onSearch: () => void;
  properties: SimplifiedProperty[];
  loading: boolean;
  error: string | null;
}

export default function MapView({ zipcode, onSearch, properties, loading, error }: MapViewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Calculate center based on properties
  const center = useMemo(() => {
    if (properties.length === 0) {
      return { lat: 34.0736, lng: -118.4004 }; // Default to Beverly Hills
    }

    const avgLat = properties.reduce((sum, prop) => sum + prop.lat, 0) / properties.length;
    const avgLng = properties.reduce((sum, prop) => sum + prop.lng, 0) / properties.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [properties]);

  const handleMarkerClick = (property: SimplifiedProperty): void => {
    setActiveMarker(property.id);
  };

  const handleInfoWindowClose = (): void => {
    setActiveMarker(null);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyIcon = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'single family':
        return '🏠';
      case 'condo':
        return '🏢';
      case 'townhouse':
        return '🏘️';
      case 'multi-family':
        return '🏬';
      case 'land':
        return '🌳';
      default:
        return '🏡';
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading Map...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔍 Loading properties for {zipcode}...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>❌ {error}</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Zipcode: {zipcode}
        </div>
        <button
          onClick={onSearch}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            backgroundColor: '#2E7D32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <GoogleMap
        zoom={properties.length > 0 ? 12 : 10}
        center={center}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={{ lat: property.lat, lng: property.lng }}
            onClick={() => handleMarkerClick(property)}
            title={property.address}
            label={{
              text: formatPrice(property.price),
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {activeMarker === property.id && (
              <InfoWindow onCloseClick={handleInfoWindowClose}>
                <div style={{ padding: '12px', maxWidth: '250px', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                      {getPropertyIcon(property.type)} {property.address}
                    </div>
                    <div style={{ fontSize: '18px', color: '#2E7D32', fontWeight: 'bold', marginBottom: '8px' }}>
                      {formatPrice(property.price)}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    {property.beds && property.baths && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Beds:</strong> {property.beds} | <strong>Baths:</strong> {property.baths}
                      </div>
                    )}
                    {property.sqft && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Sqft:</strong> {property.sqft.toLocaleString()}
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Built:</strong> {property.yearBuilt}
                      </div>
                    )}
                    {property.type && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Type:</strong> {property.type}
                      </div>
                    )}
                    {property.saleDate && (
                      <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                        Sold: {new Date(property.saleDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
      
      {/* Property count overlay */}
      {properties.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🏠 {properties.length} properties in {zipcode}
        </div>
      )}
    </div>
  );
}
