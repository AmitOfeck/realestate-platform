import { useState } from "react";
import './App.css'
import MapView from "./components/MapView";

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

export default function App() {
  const [zipcode, setZipcode] = useState("90210");
  const [properties, setProperties] = useState<SimplifiedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 5 digits
    if (/^\d{0,5}$/.test(value)) {
      setZipcode(value);
    }
  };

  const handleSearch = async () => {
    if (zipcode.length !== 5) return;
    
    setLoading(true);
    setError(null);
    setProperties([]);
    
    try {
      console.log(`🔍 Searching for properties in zipcode: ${zipcode}`);
      const response = await fetch(`http://localhost:8080/api/scrape/${zipcode}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log(`✅ Successfully loaded ${data.data.length} properties`);
        setProperties(data.data);
      } else {
        console.error(`❌ Failed to fetch properties: ${data.message}`);
        setError(data.message || 'Failed to fetch properties');
      }
    } catch (err) {
      console.error('❌ Error fetching properties:', err);
      setError('Network error - unable to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ 
        textAlign: "center", 
        padding: "20px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ddd"
      }}>
        <h1 style={{ margin: "0 0 20px 0", color: "#333" }}>🏠 Real Estate Map</h1>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          <label style={{ fontSize: "16px", fontWeight: "bold", color: "#555" }}>
            Zipcode:
          </label>
          <input
            type="text"
            value={zipcode}
            onChange={handleZipcodeChange}
            placeholder="Enter 5-digit zipcode"
            style={{
              padding: "8px 12px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "4px",
              width: "120px",
              textAlign: "center"
            }}
            maxLength={5}
          />
          <button
            onClick={handleSearch}
            disabled={zipcode.length !== 5 || loading}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              backgroundColor: (zipcode.length === 5 && !loading) ? "#2E7D32" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: (zipcode.length === 5 && !loading) ? "pointer" : "not-allowed",
              fontWeight: "bold"
            }}
          >
            {loading ? "⏳ Searching..." : "🔍 Search"}
          </button>
        </div>
        
        <div style={{ 
          fontSize: "14px", 
          color: "#666", 
          marginTop: "10px",
          fontStyle: "italic"
        }}>
          Enter a 5-digit US zipcode and click Search to view real estate properties
        </div>
      </div>
      
      <MapView 
        zipcode={zipcode}
        onSearch={handleSearch}
        properties={properties}
        loading={loading}
        error={error}
      />
    </div>
  );
}
