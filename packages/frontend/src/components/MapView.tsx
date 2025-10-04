import React from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Property } from '../../../../types/Property';
import PropertyCard from './PropertyCard';
import { useResponsive } from '../hooks/useResponsive';
import { useMapLogic } from '../hooks/useMapLogic';
import styles from './MapView.module.css';

interface MapViewProps {
  properties: Property[];
}

const MapView: React.FC<MapViewProps> = ({ properties = [] }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { isMobile, isTablet, mapHeight } = useResponsive();
  const { activeMarker, center, zoom, handleMarkerClick, handleInfoWindowClose } = useMapLogic(properties);

  const mapContainerStyle = {
    width: '100%',
    height: mapHeight,
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  const getMapContainerClassName = () => {
    if (isMobile) return styles.mapContainerMobile;
    if (isTablet) return styles.mapContainerTablet;
    return styles.mapContainerDesktop;
  };

  if (!isLoaded) {
    return (
      <div className={styles.mapWrapper}>
        <div className={styles.loadingContainer}>
          Loading Map...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <div className={`${styles.mapContainer} ${getMapContainerClassName()}`}>
        <GoogleMap
          zoom={zoom}
          center={center}
          mapContainerStyle={mapContainerStyle}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              onClick={() => handleMarkerClick(property)}
              options={{
                animation: window.google?.maps.Animation.DROP
              }}
            >
              {activeMarker === property.id && (
                <InfoWindow
                  onCloseClick={handleInfoWindowClose}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -10)
                  }}
                >
                  <PropertyCard property={property} />
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapView;