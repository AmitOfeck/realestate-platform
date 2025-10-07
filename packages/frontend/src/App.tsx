import { useState, useCallback, useMemo } from "react";
import './styles/pages/App.css'
import PropertyGrid from "./components/PropertyGrid";
import PropertyFilters from "./components/PropertyFilters";
import MapView from "./components/MapView";
import { Property } from "../../backend/src/types/property";

export default function App() {
  const [zipcode, setZipcode] = useState("90210");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    zipcode: string;
    count: number;
  } | null>(null);
  const [filters, setFilters] = useState<any>({});

  // Memoized filtered properties for performance
  const filteredProperties = useMemo(() => {
    if (!allProperties.length || !Object.keys(filters).length) {
      return allProperties;
    }

    return allProperties.filter(property => {
      // Price filter
      if (filters.minPrice && property.price && property.price < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && property.price && property.price > Number(filters.maxPrice)) {
        return false;
      }

      // Bedroom filter
      if (filters.minBeds && property.bedrooms && property.bedrooms < Number(filters.minBeds)) {
        return false;
      }
      if (filters.maxBeds && property.bedrooms && property.bedrooms > Number(filters.maxBeds)) {
        return false;
      }

      // Sqft filter
      if (filters.minSqft && property.sqft && property.sqft < Number(filters.minSqft)) {
        return false;
      }
      if (filters.maxSqft && property.sqft && property.sqft > Number(filters.maxSqft)) {
        return false;
      }

      // Year built filter
      if (filters.yearBuiltFrom && property.yearBuilt && property.yearBuilt < Number(filters.yearBuiltFrom)) {
        return false;
      }
      if (filters.yearBuiltTo && property.yearBuilt && property.yearBuilt > Number(filters.yearBuiltTo)) {
        return false;
      }

      // Sale year filter
      if (filters.yearOfSaleFrom && property.saleDate) {
        const saleYear = new Date(property.saleDate).getFullYear();
        if (saleYear < Number(filters.yearOfSaleFrom)) {
          return false;
        }
      }
      if (filters.yearOfSaleTo && property.saleDate) {
        const saleYear = new Date(property.saleDate).getFullYear();
        if (saleYear > Number(filters.yearOfSaleTo)) {
          return false;
        }
      }

      return true;
    });
  }, [allProperties, filters]);

  const handleZipcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 5 digits
    if (/^\d{0,5}$/.test(value)) {
      setZipcode(value);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (zipcode.length !== 5) return;
    
    setLoading(true);
    setError(null);
    setAllProperties([]);
    setSearchResults(null);
    
    try {
      console.log(`🔍 Searching for properties in zipcode: ${zipcode}`);
      
      const url = `http://localhost:8080/api/previous-sales/${zipcode}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.properties) {
        console.log(`✅ Successfully loaded ${data.properties.length} properties`);
        setAllProperties(data.properties);
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
  }, [zipcode]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

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

      {/* Map View */}
      <div className="map-section">
        <MapView 
          properties={filteredProperties}
          loading={loading}
          error={error}
        />
      </div>

      {/* Results */}
      <div className="results-container">
        <PropertyGrid 
          properties={filteredProperties}
          loading={loading}
          error={error}
          searchResults={searchResults}
          onRetry={handleSearch}
        />
      </div>
    </div>
  );
}