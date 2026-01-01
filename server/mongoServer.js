/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getExtraOptions, connectMongo } from './mongoService.js';

dotenv.config();

const app = express();
const PORT = process.env.MONGO_SERVER_PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MongoDB Data Service',
    port: PORT,
    uptime: process.uptime()
  });
});

// Get extra options endpoint
app.get('/api/extra-options', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'NIFTY';
    const currentPrice = parseFloat(req.query.currentPrice);
    
    if (!currentPrice || isNaN(currentPrice)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid currentPrice parameter'
      });
    }

    const extraOptions = await getExtraOptions(symbol, currentPrice, 3);
    
    res.json({
      status: 'success',
      data: extraOptions
    });
  } catch (error) {
    console.error('[MongoDB Server] Error fetching extra options:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectMongo();
    console.log('[MongoDB Server] MongoDB connection established');
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`[MongoDB Server] Running on http://localhost:${PORT}`);
      console.log('[MongoDB Server] Endpoints:');
      console.log(`  - GET /api/health`);
      console.log(`  - GET /api/extra-options?currentPrice=26000`);
    });
  } catch (error) {
    console.error('[MongoDB Server] Failed to start:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[MongoDB Server] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[MongoDB Server] Shutting down...');
  process.exit(0);
});

// Start the server
startServer();
