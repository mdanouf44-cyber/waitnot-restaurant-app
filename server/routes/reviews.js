import express from 'express';
import jwt from 'jsonwebtoken';
import { reviewDB } from '../db.js';

const router = express.Router();

// Get reviews for a menu item
router.get('/item/:restaurantId/:itemId', async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const reviews = await reviewDB.findByItem(restaurantId, itemId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await reviewDB.findByRestaurant(restaurantId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a review (requires authentication)
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const { restaurantId, itemId, itemName, rating, comment } = req.body;

    if (!restaurantId || !itemId || !rating) {
      return res.status(400).json({ error: 'Restaurant ID, Item ID, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await reviewDB.create({
      restaurantId,
      itemId,
      itemName,
      userId: decoded.userId,
      username: decoded.username,
      rating,
      comment: comment || '',
      createdAt: new Date()
    });

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate random reviews for testing
router.post('/generate-random', async (req, res) => {
  try {
    const { restaurantId, itemId, itemName, count = 5 } = req.body;

    if (!restaurantId || !itemId) {
      return res.status(400).json({ error: 'Restaurant ID and Item ID are required' });
    }

    const usernames = ['FoodLover', 'HungryTom', 'ChefMike', 'TastyFan', 'Gourmet123', 'FoodiePro', 'YummyEater', 'CuisineKing'];
    const comments = [
      'Absolutely delicious! Highly recommend.',
      'Great taste and perfect portion size.',
      'One of the best dishes I\'ve tried here.',
      'Fresh ingredients and amazing flavor.',
      'Worth every penny! Will order again.',
      'Exceeded my expectations!',
      'Perfect blend of spices.',
      'Cooked to perfection!',
      'My new favorite dish.',
      'Simply outstanding!',
      'Good but could be better.',
      'Decent taste, nothing special.',
      'Not bad, but I\'ve had better.',
      'Average quality for the price.',
      'It was okay, might try something else next time.'
    ];

    const reviews = [];
    for (let i = 0; i < count; i++) {
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      const username = usernames[Math.floor(Math.random() * usernames.length)];
      const comment = comments[Math.floor(Math.random() * comments.length)];

      const review = await reviewDB.create({
        restaurantId,
        itemId,
        itemName,
        userId: 'random_' + Date.now() + '_' + i,
        username,
        rating,
        comment,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });

      reviews.push(review);
    }

    res.json({
      success: true,
      message: `Generated ${count} random reviews`,
      reviews
    });
  } catch (error) {
    console.error('Error generating reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
