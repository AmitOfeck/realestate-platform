import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

export default function MapView({ properties }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => ({ lat: 32.0853, lng: 34.7818 }), []); 

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerStyle={{ width: "100%", height: "100vh" }}
    >
      {properties.map((p) => (
        <Marker key={p.id} position={{ lat: p.lat, lng: p.lng }} />
      ))}
    </GoogleMap>
  );
}
