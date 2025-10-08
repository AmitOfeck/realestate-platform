import { useMemo } from 'react';
import { Property } from "../../../backend/src/types/property";
import '../styles/components/PropertyGrid.css';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface PropertyGridProps {
  properties: Property[];
  loading: boolean;
  error: string | null;
  searchResults: {
    zipcode: string;
    count: number;
  } | null;
  pagination: PaginationInfo | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalCount, limit } = pagination;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
      
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalCount} properties
      </div>
    </div>
  );
}

export default function PropertyGrid({ 
  properties, 
  loading, 
  error, 
  searchResults, 
  pagination,
  onRetry,
  onPageChange
}: PropertyGridProps) {

  const formatPrice = useMemo(() => (price: number | null): string => {
    if (!price) return 'Price not available';
    
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    
    return `$${price.toLocaleString()}`;
  }, []);

  const formatDate = useMemo(() => (dateString: string | null): string => {
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
  }, []);

  const formatNumber = useMemo(() => (value: number | null, suffix: string = ''): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value}${suffix}`;
  }, []);

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
    <div className="results-section">
      {/* Results Header */}
      <div className="results-header">
        <h2 className="results-title">
          Previous Sales in {searchResults.zipcode}
        </h2>
        <p className="results-count">
          Found {searchResults.count} property{searchResults.count !== 1 ? 'ies' : ''}
          {pagination && (
            <span className="page-info">
              {' '}• Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          )}
        </p>
      </div>

      {/* Property Grid */}
      <div className="property-grid">
        {properties.map((property, index) => (
          <div 
            key={property.id} 
            className="property-card"
            data-property-id={property.id}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
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

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}