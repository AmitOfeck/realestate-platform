import React, { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Property } from '../../../backend/src/types/property';
import '../styles/components/MapView.css';

interface MapViewProps {
  properties: Property[];
  loading: boolean;
  error: string | null;
}

// Default center (Los Angeles)
const DEFAULT_CENTER = {
  lat: 34.0522,
  lng: -118.2437
};

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Map options for clean, minimal styling
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Custom marker icon (house emoji as base64)
const createCustomMarkerIcon = (color: string = '#3b82f6') => {
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 24)
  };
};

export default function MapView({ properties, error }: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // Map load handler
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Map unload handler
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Format price helper
  const formatPrice = (price: number | null): string => {
    if (!price) return 'Price not available';
    
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    
    return `$${price.toLocaleString()}`;
  };

  // Format number helper
  const formatNumber = (value: number | null, suffix: string = ''): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value}${suffix}`;
  };

  // Format date helper
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Handle marker click
  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    
    // Scroll to corresponding property card
    const propertyCard = document.querySelector(`[data-property-id="${property.id}"]`);
    if (propertyCard) {
      propertyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight to the card
      propertyCard.classList.add('property-card-highlighted');
      setTimeout(() => {
        propertyCard.classList.remove('property-card-highlighted');
      }, 2000);
    }
  }, []);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  // Memoized markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    return properties.map((property) => (
      <Marker
        key={property.id}
        position={{
          lat: property.latitude,
          lng: property.longitude
        }}
        icon={createCustomMarkerIcon('#3b82f6')}
        onClick={() => handleMarkerClick(property)}
        animation={google.maps.Animation.DROP}
      />
    ));
  }, [properties, handleMarkerClick]);

  // Fit bounds when properties change
  React.useEffect(() => {
    if (map && properties && properties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      properties.forEach((property) => {
        bounds.extend({
          lat: property.latitude,
          lng: property.longitude
        });
      });
      
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, properties]);

  // Handle API load error
  if (loadError) {
    return (
      <div className="map-container">
        <div className="map-error">
          <div className="map-error-icon">🗺️</div>
          <p className="map-error-text">Failed to load Google Maps</p>
        </div>
      </div>
    );
  }

  // Show loading state only if API is not loaded yet
  if (!isLoaded) {
    return (
      <div className="map-container">
        <div className="map-loading">
          <div className="map-loading-spinner"></div>
          Loading map...
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="map-container">
        <div className="map-error">
          <div className="map-error-icon">❌</div>
          <p className="map-error-text">Map unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_CENTER}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {markers}
        
        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.latitude,
              lng: selectedProperty.longitude
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="property-info-window">
              <div className="property-info-title">
                {selectedProperty.addressOneLine}
              </div>
              
              <div className="property-info-price">
                {formatPrice(selectedProperty.price)}
              </div>
              
              <div className="property-info-details">
                <span>{formatNumber(selectedProperty.bedrooms)} beds</span>
                <span> · </span>
                <span>{formatNumber(selectedProperty.bathrooms)} baths</span>
                <span> · </span>
                <span>{formatNumber(selectedProperty.sqft, ' sq ft')}</span>
              </div>
              
              {selectedProperty.saleDate && (
                <div className="property-info-date">
                  Sold on {formatDate(selectedProperty.saleDate)}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}