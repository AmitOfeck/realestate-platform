import { Property } from "../../../backend/src/types/property";
import '../styles/components/PropertyGrid.css';

interface PropertyGridProps {
  properties: Property[];
  loading: boolean;
  error: string | null;
  searchResults: {
    zipcode: string;
    count: number;
  } | null;
  onRetry: () => void;
}

export default function PropertyGrid({ 
  properties, 
  loading, 
  error, 
  searchResults, 
  onRetry 
}: PropertyGridProps) {
  
  const formatPrice = (price: number | null): string => {
    if (!price) return 'Price not available';
    
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    
    return `$${price.toLocaleString()}`;
  };

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

  const formatNumber = (value: number | null, suffix: string = ''): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value}${suffix}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Searching for properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3 className="error-title">Search Failed</h3>
        <p className="error-message">{error}</p>
        <button onClick={onRetry} className="retry-button">
          🔄 Try Again
        </button>
      </div>
    );
  }

  if (!searchResults) {
    return (
      <div className="empty-container">
        <div className="empty-icon">🏠</div>
        <h3 className="empty-title">Ready to Search</h3>
        <p className="empty-message">
          Enter a zipcode and click Search to find previous property sales in that area.
        </p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">No Properties Found</h3>
        <p className="empty-message">
          No previous sales found in zipcode {searchResults.zipcode}. 
          Try a different zipcode or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="results-header">
        <h2 className="results-title">
          Previous Sales in {searchResults.zipcode}
        </h2>
        <p className="results-count">
          Found {searchResults.count} property{searchResults.count !== 1 ? 'ies' : ''}
        </p>
      </div>

      {/* Property Grid */}
      <div className="property-grid">
        {properties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="property-card-header">
              <h3 className="property-address">
                {property.addressOneLine}
              </h3>
              
              <div className="property-price">
                {formatPrice(property.price)}
              </div>
              
              <div className="property-details">
                <div className="property-detail">
                  <span className="property-detail-icon">🛏️</span>
                  <span>{formatNumber(property.bedrooms)} beds</span>
                </div>
                <div className="property-detail">
                  <span className="property-detail-icon">🚿</span>
                  <span>{formatNumber(property.bathrooms)} baths</span>
                </div>
                <div className="property-detail">
                  <span className="property-detail-icon">📐</span>
                  <span>{formatNumber(property.sqft, ' sq ft')}</span>
                </div>
              </div>
              
              {property.propertyType && (
                <div className="property-type">
                  {property.propertyType}
                </div>
              )}
              
              {property.yearBuilt && (
                <div className="property-year">
                  Built in {property.yearBuilt}
                </div>
              )}
              
              {property.saleDate && (
                <div className="property-sale-date">
                  Sold on {formatDate(property.saleDate)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}