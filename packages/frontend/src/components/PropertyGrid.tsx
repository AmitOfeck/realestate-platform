import { Property } from "../../../../types/property";

interface PropertyGridProps {
  properties: Property[];
  loading: boolean;
  error: string | null;
  searchResults: {
    zipcode: string;
    count: number;
    averagePrice: number;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPropertyIcon = (propertyType: string | null): string => {
    if (!propertyType) return '🏡';
    
    const type = propertyType.toLowerCase();
    if (type.includes('single family') || type.includes('residence')) return '🏠';
    if (type.includes('condo') || type.includes('condominium')) return '🏢';
    if (type.includes('townhouse')) return '🏘️';
    if (type.includes('multi') || type.includes('duplex')) return '🏬';
    if (type.includes('land')) return '🌳';
    return '🏡';
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">🔍 Loading previous sales...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h3 className="error-title">Search Failed</h3>
          <p className="error-message">{error}</p>
          <button
            onClick={onRetry}
            className="retry-button"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && !error && properties.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-content">
          <div className="empty-icon">🏠</div>
          <h3 className="empty-title">No Sales Found</h3>
          <p className="empty-message">
            No previous sales found in this area. Try searching a different zipcode.
          </p>
        </div>
      </div>
    );
  }

  // Results header
  const ResultsHeader = () => {
    if (!searchResults) return null;
    
    return (
      <div className="results-header">
        <div className="results-header-content">
          <div className="results-header-left">
            <h2 className="results-title">
              Previous Sales in {searchResults.zipcode}
            </h2>
            <p className="results-subtitle">
              {searchResults.count} {searchResults.count === 1 ? 'property' : 'properties'} found
            </p>
          </div>
          <div className="results-header-right">
            <div className="average-price">
              {formatPrice(searchResults.averagePrice)}
            </div>
            <div className="average-price-label">Average Price</div>
          </div>
        </div>
      </div>
    );
  };

  // Property cards
  return (
    <div className="property-grid-container animate-fade-in">
      <ResultsHeader />
      
      <div className="property-grid">
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="property-card"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Property Header */}
            <div className="property-header">
              <div className="property-header-top">
                <div className="property-icon">
                  {getPropertyIcon(property.propertyType)}
                </div>
                <div className="property-price-section">
                  <div className="property-price">
                    {formatPrice(property.price)}
                  </div>
                  {property.pricePerSqft && (
                    <div className="price-per-sqft">
                      ${property.pricePerSqft.toLocaleString()}/sqft
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="property-address line-clamp-2">
                {property.addressOneLine}
              </h3>
              
              {property.propertyType && (
                <div className="property-type">
                  {property.propertyType}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="property-details">
              <div className="property-stats">
                {property.bedrooms && (
                  <div className="stat-item">
                    <div className="stat-value">{property.bedrooms}</div>
                    <div className="stat-label">Beds</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="stat-item">
                    <div className="stat-value">{property.bathrooms}</div>
                    <div className="stat-label">Baths</div>
                  </div>
                )}
                {property.sqft && (
                  <div className="stat-item">
                    <div className="stat-value">
                      {property.sqft.toLocaleString()}
                    </div>
                    <div className="stat-label">Sq Ft</div>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="stat-item">
                    <div className="stat-value">{property.yearBuilt}</div>
                    <div className="stat-label">Built</div>
                  </div>
                )}
              </div>

              {/* Sale Info */}
              <div className="sale-info">
                <div className="sale-info-row">
                  <span className="sale-info-label">Sold:</span>
                  <span className="sale-info-value">
                    {formatDate(property.saleDate)}
                  </span>
                </div>
                {property.saleType && (
                  <div className="sale-info-row">
                    <span className="sale-info-label">Type:</span>
                    <span className="sale-info-value">{property.saleType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
