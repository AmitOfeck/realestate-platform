import { useState, useMemo, useCallback } from 'react';
import { Property } from '../../../../types/Property';

interface MapLogicReturn {
  activeMarker: string | null;
  center: { lat: number; lng: number };
  zoom: number;
  handleMarkerClick: (property: Property) => void;
  handleInfoWindowClose: () => void;
}

export const useMapLogic = (properties: Property[]): MapLogicReturn => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Calculate optimal center and zoom based on properties
  const { center, zoom } = useMemo(() => {
    if (properties.length === 0) {
      return {
        center: { lat: 34.0736, lng: -118.4004 }, // Default Beverly Hills center
        zoom: 12
      };
    }

    // Calculate bounds to fit all properties
    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate zoom based on the spread of coordinates
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Adjust zoom based on the spread (smaller spread = higher zoom)
    let calculatedZoom = 12;
    if (maxDiff < 0.01) calculatedZoom = 14;
    else if (maxDiff < 0.02) calculatedZoom = 13;
    else if (maxDiff > 0.1) calculatedZoom = 10;
    
    return {
      center: { lat: centerLat, lng: centerLng },
      zoom: calculatedZoom
    };
  }, [properties]);

  const handleMarkerClick = useCallback((property: Property) => {
    setActiveMarker(property.id);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  return {
    activeMarker,
    center,
    zoom,
    handleMarkerClick,
    handleInfoWindowClose
  };
};
