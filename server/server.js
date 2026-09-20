const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { connectAtlasDB, getDbStatus } = require('./config/db');
const setupNegotiationSockets = require('./sockets/negotiationSocket');

const authRoutes = require('./routes/authRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const marketRoutes = require('./routes/marketRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const listingRoutes = require('./routes/listingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const locationRoutes = require('./routes/locationRoutes');
const commodityRoutes = require('./routes/commodityRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});
app.set('io', io);
setupNegotiationSockets(io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/disputes', disputeRoutes);

// Health Check Endpoint (GET /api/health)
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  const statusCode = dbStatus.connected ? 200 : 503;
  res.status(statusCode).json({
    server: "ok",
    database: dbStatus.connected ? "connected" : "disconnected",
    databaseType: "MongoDB Atlas",
    clusterHost: dbStatus.host,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Mandatory MongoDB Atlas Connection & Verification
    await connectAtlasDB();

    // 2. Error handling for port conflicts
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use by another instance.`);
        console.error(`To free port ${PORT}, run in terminal: lsof -ti :${PORT} | xargs kill -9\n`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });

    // 3. Start Express & Socket.IO server only after database is confirmed connected
    server.listen(PORT, () => {
      console.log(`\n🌾 =================================================`);
      console.log(`🌾  KisanSetu AI - API Gateway & Decision Engine`);
      console.log(`🌾  Primary Database: MongoDB Atlas (Connected)`);
      console.log(`🌾  Running at: http://localhost:${PORT}`);
      console.log(`🌾 =================================================\n`);
    });
  } catch (err) {
    console.error('❌ FATAL: Server startup halted because MongoDB Atlas connection could not be verified.');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
};

startServer();
