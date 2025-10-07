import { useState } from "react";
import './styles/pages/App.css'
import PropertyGrid from "./components/PropertyGrid";
import PropertyFilters from "./components/PropertyFilters";
import { Property } from "../../backend/src/types/property";

export default function App() {
  const [zipcode, setZipcode] = useState("90210");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    zipcode: string;
    count: number;
  } | null>(null);
  const [filters, setFilters] = useState<any>({});

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
    setSearchResults(null);
    
    try {
      console.log(`🔍 Searching for properties in zipcode: ${zipcode} with filters:`, filters);
      
      // Build query string with filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const queryString = queryParams.toString();
      const url = `http://localhost:8080/api/previous-sales/${zipcode}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.properties) {
        console.log(`✅ Successfully loaded ${data.properties.length} properties`);
        setProperties(data.properties);
        setSearchResults({
          zipcode: zipcode,
          count: data.count || data.properties.length,
        });
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

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-inner">
            <h1 className="main-title">
              🏠 Previous Sales Search
            </h1>
            
            <div className="search-container">
              <label className="search-label">
                Zipcode:
              </label>
              <input
                type="text"
                value={zipcode}
                onChange={handleZipcodeChange}
                placeholder="Enter 5-digit zipcode"
                className="search-input"
                maxLength={5}
              />
              <button
                onClick={handleSearch}
                disabled={zipcode.length !== 5 || loading}
                className={`search-button ${zipcode.length === 5 && !loading ? 'search-button-active' : 'search-button-disabled'}`}
              >
                {loading ? "⏳ Searching..." : "🔍 Search"}
              </button>
            </div>
            
            <p className="search-description">
              Enter a 5-digit US zipcode and click Search to view previous property sales
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <PropertyFilters 
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Results */}
      <div className="results-container">
        <PropertyGrid 
          properties={properties}
          loading={loading}
          error={error}
          searchResults={searchResults}
          onRetry={handleSearch}
        />
      </div>
    </div>
  );
}