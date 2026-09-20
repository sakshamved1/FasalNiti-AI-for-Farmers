/**
 * Database Adapter & Compatibility Layer
 * Delegates all connectivity directly to MongoDB Atlas via server/config/db.js.
 * In-memory fallback is disabled in production.
 */

const { connectAtlasDB, getDbStatus, isConnected } = require('../config/db');

// In-Memory store stub for legacy unit tests only
const memoryStore = {
  users: [],
  markets: [],
  crops: [],
  marketPrices: [],
  pricePredictions: [],
  governmentSchemes: [],
  governmentOffices: [],
  warehouses: [],
  transportProviders: [],
  listings: [],
  offers: [],
  orders: [],
  disputes: [],
  grievances: [],
  notifications: [],
  supportTickets: [],
  auditLogs: []
};

// Strict rule: MongoDB Atlas is mandatory. Never use in-memory store in production.
const isInMemory = () => false;

const connectDB = async () => {
  return await connectAtlasDB();
};

module.exports = {
  connectDB,
  connectAtlasDB,
  getDbStatus,
  isInMemory,
  isConnected,
  memoryStore
};
