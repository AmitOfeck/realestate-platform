import { useState, useCallback } from "react";
import './styles/pages/App.css'
import PropertyGrid from "./components/PropertyGrid";
import PropertyFilters from "./components/PropertyFilters";
import MapView from "./components/MapView";
import { Property } from "../../backend/src/types/property";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

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
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const handleZipcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 5 digits
    if (/^\d{0,5}$/.test(value)) {
      setZipcode(value);
    }
  }, []);

  const fetchProperties = useCallback(async (page: number = 1) => {
    if (zipcode.length !== 5) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Fetching properties for zipcode: ${zipcode} (page ${page})`);
      
      // Build query string with filters and pagination
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      queryParams.append('page', page.toString());
      queryParams.append('limit', '10');
      
      const queryString = queryParams.toString();
      const url = `http://localhost:8080/api/previous-sales/${zipcode}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.properties) {
        console.log(`✅ Successfully loaded ${data.properties.length} properties (page ${page})`);
        setProperties(data.properties);
        setPagination(data.pagination);
        setSearchResults({
          zipcode: zipcode,
          count: data.pagination.totalCount,
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
  }, [zipcode, filters]);

  const handleSearch = useCallback(async () => {
    if (zipcode.length !== 5) return;
    
    setProperties([]);
    setSearchResults(null);
    setPagination(null);
    
    await fetchProperties(1);
  }, [zipcode, fetchProperties]);

  const handlePageChange = useCallback(async (newPage: number) => {
    if (!pagination || newPage < 1 || newPage > pagination.totalPages) return;
    
    await fetchProperties(newPage);
  }, [pagination, fetchProperties]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    setPagination(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPagination(null);
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
          properties={properties}
          loading={loading}
          error={error}
        />
      </div>

      {/* Results */}
      <div className="results-container">
        <PropertyGrid 
          properties={properties}
          loading={loading}
          error={error}
          searchResults={searchResults}
          pagination={pagination}
          onRetry={handleSearch}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}