import express from 'express';
import { restaurantDB } from '../db.js';

const router = express.Router();

// Search restaurants
router.get('/search', async (req, res) => {
  try {
    const { q, delivery } = req.query;
    let restaurants = await restaurantDB.search(q);
    
    if (delivery === 'true') {
      restaurants = restaurants.filter(r => r.isDeliveryAvailable);
    }
    
    // Remove password from response
    restaurants = restaurants.map(r => {
      const { password, ...rest } = r;
      return rest;
    });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    let restaurants = await restaurantDB.findAll();
    restaurants = restaurants.map(r => {
      const { password, ...rest } = r;
      return rest;
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update table count (MUST be before GET /:id)
router.patch('/:id/tables', async (req, res) => {
  try {
    console.log('Updating table count for restaurant:', req.params.id);
    console.log('Request body:', req.body);
    
    const { tables } = req.body;
    
    if (typeof tables !== 'number' || tables < 0) {
      console.log('Invalid table count:', tables);
      return res.status(400).json({ error: 'Invalid table count' });
    }
    
    const restaurant = await restaurantDB.update(req.params.id, { tables });
    if (!restaurant) {
      console.log('Restaurant not found:', req.params.id);
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    console.log('Table count updated successfully:', restaurant.tables);
    
    const { password, ...rest } = restaurant;
    res.json(rest);
  } catch (error) {
    console.error('Error updating table count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await restaurantDB.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    // Add ratings to menu items
    if (restaurant.menu && restaurant.menu.length > 0) {
      const { reviewDB } = await import('../db.js');
      
      restaurant.menu = await Promise.all(restaurant.menu.map(async (item) => {
        const reviews = await reviewDB.findByItem(req.params.id, item._id);
        const averageRating = reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;
        
        return {
          ...item,
          averageRating: parseFloat(averageRating),
          reviewCount: reviews.length
        };
      }));
    }
    
    const { password, ...rest } = restaurant;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add menu item
router.post('/:id/menu', async (req, res) => {
  try {
    const restaurant = await restaurantDB.addMenuItem(req.params.id, req.body);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.put('/:id/menu/:menuId', async (req, res) => {
  try {
    const restaurant = await restaurantDB.updateMenuItem(req.params.id, req.params.menuId, req.body);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant or menu item not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/:id/menu/:menuId', async (req, res) => {
  try {
    const restaurant = await restaurantDB.deleteMenuItem(req.params.id, req.params.menuId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant or menu item not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment settings
router.patch('/:id/payment-settings', async (req, res) => {
  try {
    const { upiId, upiName, acceptCash, acceptUPI } = req.body;
    
    const paymentSettings = {
      upiId: upiId || '',
      upiName: upiName || '',
      acceptCash: acceptCash !== undefined ? acceptCash : true,
      acceptUPI: acceptUPI !== undefined ? acceptUPI : false
    };
    
    const restaurant = await restaurantDB.update(req.params.id, { paymentSettings });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    const { password, ...rest } = restaurant;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location settings
router.patch('/:id/location-settings', async (req, res) => {
  try {
    const { latitude, longitude, deliveryRadiusKm, address } = req.body;
    
    // Validate coordinates
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90' });
    }
    
    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180' });
    }
    
    if (deliveryRadiusKm !== undefined && (isNaN(deliveryRadiusKm) || deliveryRadiusKm < 0)) {
      return res.status(400).json({ error: 'Invalid delivery radius. Must be a positive number' });
    }
    
    const locationSettings = {};
    if (latitude !== undefined) locationSettings.latitude = parseFloat(latitude);
    if (longitude !== undefined) locationSettings.longitude = parseFloat(longitude);
    if (deliveryRadiusKm !== undefined) locationSettings.deliveryRadiusKm = parseFloat(deliveryRadiusKm);
    if (address !== undefined) locationSettings.address = address;
    
    const restaurant = await restaurantDB.update(req.params.id, locationSettings);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    const { password, ...rest } = restaurant;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check delivery availability
router.post('/:id/check-delivery', async (req, res) => {
  try {
    const { userLatitude, userLongitude } = req.body;
    
    if (!userLatitude || !userLongitude) {
      return res.status(400).json({ error: 'User location is required' });
    }
    
    const restaurant = await restaurantDB.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    // If restaurant doesn't have location configured, allow delivery
    if (!restaurant.latitude || !restaurant.longitude || !restaurant.deliveryRadiusKm) {
      return res.json({ 
        allowed: true, 
        distance: null,
        message: 'Restaurant location not configured' 
      });
    }
    
    // Calculate distance using Haversine formula
    const R = 6371; // Earth radius in km
    const toRad = (value) => (value * Math.PI) / 180;
    
    const dLat = toRad(userLatitude - restaurant.latitude);
    const dLon = toRad(userLongitude - restaurant.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(restaurant.latitude)) *
        Math.cos(toRad(userLatitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in km
    
    const allowed = distance <= restaurant.deliveryRadiusKm;
    
    res.json({
      allowed,
      distance: parseFloat(distance.toFixed(2)),
      deliveryRadiusKm: restaurant.deliveryRadiusKm,
      message: allowed 
        ? 'You are in the delivery zone' 
        : 'You are outside the delivery zone'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
