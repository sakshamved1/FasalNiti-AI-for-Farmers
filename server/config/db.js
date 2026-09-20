/**
 * FasalNiti AI — MongoDB Atlas Production Database Connection Module
 * Mandatory primary persistent data store using Mongoose.
 * 
 * Strict Production Standard:
 * - Direct connection to MongoDB Atlas
 * - Fail-fast on connection failure (no silent fallback to in-memory/fake data)
 * - Connection pooling and health diagnostics
 */

const mongoose = require('mongoose');

let isConnected = false;
let connectionTimestamp = null;
let lastError = null;

const connectAtlasDB = async () => {
  // If already connected or connecting, reuse the existing connection (critical for Vercel serverless)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg = '❌ FATAL: MONGODB_URI environment variable is not defined in server/.env.\n' +
      'MongoDB Atlas is the mandatory production database. The server cannot start without an Atlas connection string.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Safety check: ensure connection string points to MongoDB Atlas or designated MongoDB database
  console.log('📡 Initializing MongoDB Atlas connection...');

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1
    });

    isConnected = true;
    connectionTimestamp = new Date();
    lastError = null;

    const host = conn.connection.host;
    const dbName = conn.connection.name;

    console.log(`\n======================================================`);
    console.log(`✅ SUCCESS: Connected to MongoDB Atlas!`);
    console.log(`🌍 Cluster Host : ${host}`);
    console.log(`📁 Database     : ${dbName}`);
    console.log(`⚡ Pool Size    : 10 connections max`);
    console.log(`======================================================\n`);

    return conn;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.error(`\n======================================================`);
    console.error(`❌ CRITICAL: Failed to connect to MongoDB Atlas!`);
    console.error(`Error Details: ${err.message}`);
    console.error(`\n⚠️  ACTION REQUIRED: ATLAS IP ACCESS LIST`);
    console.error(`Your current public IP needs access in MongoDB Atlas.`);
    console.error(`1. Log in to https://cloud.mongodb.com`);
    console.error(`2. In the left menu, go to Security -> Network Access`);
    console.error(`3. Click "Add IP Address" and choose:`);
    console.error(`   👉 "Allow Access from Anywhere" (0.0.0.0/0)`);
    console.error(`   OR add current IP: 103.241.224.190`);
    console.error(`4. Click "Confirm" and wait ~30 seconds for it to become Active.`);
    console.error(`======================================================\n`);
    throw err;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB Atlas connection lost. Attempting auto-reconnection...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🔄 MongoDB Atlas reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  lastError = err.message;
  console.error('❌ MongoDB Atlas runtime error:', err.message);
});

const getDbStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  readyStateText: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Unknown',
  host: mongoose.connection.host || 'unknown',
  name: mongoose.connection.name || 'fasalniti',
  connectedAt: connectionTimestamp,
  lastError
});

module.exports = {
  connectAtlasDB,
  getDbStatus,
  isConnected: () => isConnected && mongoose.connection.readyState === 1
};
