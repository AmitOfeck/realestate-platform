import { useState, useEffect } from "react";
import './App.css'
import MapView from "./components/MapView";

export default function App() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then(setProperties)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Real Estate Map</h1>
      <MapView properties={properties} />
    </div>
  );
}
