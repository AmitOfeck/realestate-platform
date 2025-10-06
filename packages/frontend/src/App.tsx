import { useState, useEffect } from "react";
import './App.css'
import MapView from "./components/MapView";
import { Property, PropertiesResponse } from "../../../types/Property";

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        console.log(data); 
        setProperties(data.data?.data || []); 
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Real Estate Map</h1>
      <MapView properties={properties} />
    </div>
  );
}
