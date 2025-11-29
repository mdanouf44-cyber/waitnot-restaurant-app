import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDB, restaurantDB } from './db.js';
import bcrypt from 'bcryptjs';

import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import reelsRoutes from './routes/reels.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import voiceRoutes from './routes/voice.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit for base64 videos
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize local database
await initDB();

// Auto-seed if database is empty
const existingRestaurants = await restaurantDB.findAll();
if (existingRestaurants.length === 0) {
  console.log('📦 Database is empty, seeding with sample data...');
  
  const sampleRestaurants = [
    {
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with a modern twist',
      rating: 4.5,
      deliveryTime: '30-40 min',
      cuisine: ['Indian', 'North Indian', 'Tandoor'],
      address: '123 Main Street, City',
      phone: '1234567890',
      email: 'spice@example.com',
      password: await bcrypt.hash('password123', 10),
      isDeliveryAvailable: true,
      tables: 10,
      menu: [
        { name: 'Paneer Tikka', price: 250, category: 'Starters', isVeg: true, description: 'Grilled cottage cheese with spices', available: true },
        { name: 'Chicken Biryani', price: 350, category: 'Main Course', isVeg: false, description: 'Aromatic rice with tender chicken', available: true },
        { name: 'Dal Makhani', price: 200, category: 'Main Course', isVeg: true, description: 'Creamy black lentils', available: true },
        { name: 'Pizza', price: 299, category: 'Main Course', isVeg: true, description: 'Delicious pizza', available: true }
      ]
    }
  ];
  
  for (const rest of sampleRestaurants) {
    const menuWithIds = rest.menu.map(item => ({
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      ...item
    }));
    
    await restaurantDB.create({
      ...rest,
      menu: menuWithIds
    });
  }
  
  console.log('✅ Database seeded with sample restaurant');
}

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/voice', voiceRoutes);

// Socket.IO for real-time orders
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-restaurant', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
