import React, { useState } from 'react';
import './PropertyFilters.css';

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function PropertyFilters({ onFiltersChange, onClearFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minSqft: '',
    maxSqft: '',
    yearBuiltFrom: '',
    yearBuiltTo: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
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
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minSqft: '',
      maxSqft: '',
      yearBuiltFrom: '',
      yearBuiltTo: ''
    });
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="filters-container">
      <div className="filters-header">
        <button 
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="filters-icon">🔍</span>
          <span className="filters-title">Filter Properties</span>
          {hasActiveFilters && <span className="active-indicator">●</span>}
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear All
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="filters-content">
          <div className="filters-grid">
            {/* Price Range */}
            <div className="filter-group">
              <label>💰 Price Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="filter-group">
              <label>🛏️ Bedrooms</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minBeds}
                  onChange={(e) => handleFilterChange('minBeds', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxBeds}
                  onChange={(e) => handleFilterChange('maxBeds', e.target.value)}
                />
              </div>
            </div>

            {/* Square Feet */}
            <div className="filter-group">
              <label>📐 Square Feet</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min Sq Ft"
                  value={filters.minSqft}
                  onChange={(e) => handleFilterChange('minSqft', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max Sq Ft"
                  value={filters.maxSqft}
                  onChange={(e) => handleFilterChange('maxSqft', e.target.value)}
                />
              </div>
            </div>

            {/* Year Built */}
            <div className="filter-group">
              <label>📅 Year Built</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="From Year"
                  value={filters.yearBuiltFrom}
                  onChange={(e) => handleFilterChange('yearBuiltFrom', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="To Year"
                  value={filters.yearBuiltTo}
                  onChange={(e) => handleFilterChange('yearBuiltTo', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
