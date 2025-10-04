import React from 'react';
import { Property } from '../../../../types/Property';
import styles from './MapView.module.css';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=Property+Image';
  };

  return (
    <div className={styles.propertyCard}>
      <img
        src={property.image || 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=Property+Image'}
        alt={property.name}
        className={styles.propertyImage}
        onError={handleImageError}
      />
      
      <div className={styles.propertyContent}>
        <h3 className={styles.propertyName}>
          {property.name}
        </h3>
        
        <div className={styles.propertyPrice}>
          {formatPrice(property.price)}
        </div>
        
        <div className={styles.propertyDetails}>
          {property.bedrooms && (
            <div className={styles.propertyDetail}>
              <span className={styles.propertyDetailIcon}>🛏</span>
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className={styles.propertyDetail}>
              <span className={styles.propertyDetailIcon}>🛁</span>
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {property.sqft && (
            <div className={styles.propertyDetail}>
              <span className={styles.propertyDetailIcon}>📐</span>
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
