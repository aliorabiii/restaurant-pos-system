import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🍔 Restaurant POS Backend API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  });