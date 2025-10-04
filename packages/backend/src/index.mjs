import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample properties data for Beverly Hills area
const properties = [
  {
    id: '1',
    name: 'Luxury Beverly Hills Estate',
    price: 2500000,
    lat: 34.0736,
    lng: -118.4004,
    image: 'https://via.placeholder.com/100x60/4CAF50/white?text=Luxury+Estate',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3500,
    zipcode: '90210'
  },
  {
    id: '2',
    name: 'Modern Hillside Villa',
    price: 1800000,
    lat: 34.0800,
    lng: -118.4100,
    image: 'https://via.placeholder.com/100x60/2196F3/white?text=Modern+Villa',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    zipcode: '90210'
  },
  {
    id: '3',
    name: 'Classic Beverly Hills Home',
    price: 3200000,
    lat: 34.0650,
    lng: -118.3900,
    image: 'https://via.placeholder.com/100x60/FF9800/white?text=Classic+Home',
    bedrooms: 6,
    bathrooms: 5,
    sqft: 4200,
    zipcode: '90210'
  },
  {
    id: '4',
    name: 'Contemporary Condo',
    price: 1200000,
    lat: 34.0850,
    lng: -118.4200,
    image: 'https://via.placeholder.com/100x60/9C27B0/white?text=Contemporary',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    zipcode: '90210'
  },
  {
    id: '5',
    name: 'Penthouse with City Views',
    price: 4500000,
    lat: 34.0700,
    lng: -118.3800,
    image: 'https://via.placeholder.com/100x60/F44336/white?text=Penthouse',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3200,
    zipcode: '90210'
  }
];

// Routes
app.get('/api/properties', (req, res) => {
  try {
    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties'
    });
  }
});

app.get('/api/properties/:id', (req, res) => {
  try {
    const property = properties.find(p => p.id === req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Properties API available at http://localhost:${PORT}/api/properties`);
});
