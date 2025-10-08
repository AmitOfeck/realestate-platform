import { useState, useCallback, useMemo } from 'react';
import '../styles/components/PropertyFilters.css';

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  maxBeds: string;
  minSqft: string;
  maxSqft: string;
  yearBuiltFrom: string;
  yearBuiltTo: string;
  yearOfSaleFrom: string;
  yearOfSaleTo: string;
}

export default function PropertyFilters({ onFiltersChange, onClearFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minSqft: '',
    maxSqft: '',
    yearBuiltFrom: '',
    yearBuiltTo: '',
    yearOfSaleFrom: '',
    yearOfSaleTo: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced filter change handler for smooth UX
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert to proper types and remove empty values
    const processedFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onFiltersChange(processedFilters);
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minSqft: '',
      maxSqft: '',
      yearBuiltFrom: '',
      yearBuiltTo: '',
      yearOfSaleFrom: '',
      yearOfSaleTo: ''
    };
    setFilters(emptyFilters);
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(value => value !== ''), 
    [filters]
  );

  const activeFilterCount = useMemo(() => 
    Object.values(filters).filter(value => value !== '').length,
    [filters]
  );

  return (
    <div className="filters-container">
      <div className="filters-header">
        <button 
          className={`filters-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="filters-icon">🔍</span>
          <span className="filters-title">Smart Filters</span>
          {hasActiveFilters && (
            <span className="active-badge">
              {activeFilterCount}
            </span>
          )}
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {hasActiveFilters && (
          <button 
            onClick={handleClearFilters} 
            className="clear-filters-btn"
          >
            <span className="clear-icon">✕</span>
            Clear All
          </button>
        )}
      </div>
      
      <div className={`filters-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filters-grid">
          {/* Price Range */}
          <div className="filter-group">
            <div className="filter-header">
              <span className="filter-icon">💰</span>
              <label className="filter-label">Price Range</label>
            </div>
            <div className="range-inputs">
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="filter-input"
                />
                <span className="input-suffix">$</span>
              </div>
              <span className="range-separator">to</span>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="filter-input"
                />
                <span className="input-suffix">$</span>
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="filter-group">
            <div className="filter-header">
              <span className="filter-icon">🛏️</span>
              <label className="filter-label">Bedrooms</label>
            </div>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minBeds}
                onChange={(e) => handleFilterChange('minBeds', e.target.value)}
                className="filter-input"
                min="0"
                max="20"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxBeds}
                onChange={(e) => handleFilterChange('maxBeds', e.target.value)}
                className="filter-input"
                min="0"
                max="20"
              />
            </div>
          </div>

          {/* Square Feet */}
          <div className="filter-group">
            <div className="filter-header">
              <span className="filter-icon">📐</span>
              <label className="filter-label">Square Feet</label>
            </div>
            <div className="range-inputs">
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Min Sq Ft"
                  value={filters.minSqft}
                  onChange={(e) => handleFilterChange('minSqft', e.target.value)}
                  className="filter-input"
                />
                <span className="input-suffix">ft²</span>
              </div>
              <span className="range-separator">to</span>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Max Sq Ft"
                  value={filters.maxSqft}
                  onChange={(e) => handleFilterChange('maxSqft', e.target.value)}
                  className="filter-input"
                />
                <span className="input-suffix">ft²</span>
              </div>
            </div>
          </div>

          {/* Year Built */}
          <div className="filter-group">
            <div className="filter-header">
              <span className="filter-icon">📅</span>
              <label className="filter-label">Year Built</label>
            </div>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="From Year"
                value={filters.yearBuiltFrom}
                onChange={(e) => handleFilterChange('yearBuiltFrom', e.target.value)}
                className="filter-input"
                min="1800"
                max="2024"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="To Year"
                value={filters.yearBuiltTo}
                onChange={(e) => handleFilterChange('yearBuiltTo', e.target.value)}
                className="filter-input"
                min="1800"
                max="2024"
              />
            </div>
          </div>

          {/* Sale Year */}
          <div className="filter-group">
            <div className="filter-header">
              <span className="filter-icon">🏠</span>
              <label className="filter-label">Sale Year</label>
            </div>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="From Year"
                value={filters.yearOfSaleFrom}
                onChange={(e) => handleFilterChange('yearOfSaleFrom', e.target.value)}
                className="filter-input"
                min="2020"
                max="2024"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="To Year"
                value={filters.yearOfSaleTo}
                onChange={(e) => handleFilterChange('yearOfSaleTo', e.target.value)}
                className="filter-input"
                min="2020"
                max="2024"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}