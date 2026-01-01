/* eslint-disable no-console */
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchLTP, getRateLimitStatus } from './upstoxService.js';
import { getExtraOptions, getSymbolData, getNiftyData } from './mongoService.js';
import { fetchExtraLTP } from './upstoxServiceExtra.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const UPDATE_INTERVAL_MS = parseInt(process.env.UPDATE_INTERVAL_MS) || 3000;
const EXTRA_LTP_INTERVAL = parseInt(process.env.EXTRA_LTP_INTERVAL) || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Load symbol data from MongoDB (with fallback to data.json for NIFTY)
const loadSymbolData = async (symbol) => {
  try {
    // Try to fetch from MongoDB first
    console.log(`[Server] Attempting to load ${symbol} data from MongoDB...`);
    const mongoData = await getSymbolData(symbol);
    
    if (mongoData) {
      console.log(`[Server] Successfully loaded ${symbol} data from MongoDB`);
      return mongoData;
    }
    
    // Fallback to data.json only for NIFTY
    if (symbol === 'NIFTY') {
      console.log('[Server] MongoDB unavailable, falling back to data.json...');
      const dataPath = join(__dirname, '..', 'data.json');
      const rawData = readFileSync(dataPath, 'utf-8');
      const jsonData = JSON.parse(rawData);
      console.log('[Server] Successfully loaded NIFTY data from data.json');
      return jsonData;
    }
    
    console.error(`[Server] No data found for ${symbol}`);
    return null;
    
  } catch (error) {
    console.error(`[Server] Error loading ${symbol} data:`, error.message);
    
    // Last resort: try data.json for NIFTY
    if (symbol === 'NIFTY') {
      try {
        const dataPath = join(__dirname, '..', 'data.json');
        const rawData = readFileSync(dataPath, 'utf-8');
        return JSON.parse(rawData);
      } catch (fallbackError) {
        console.error('[Server] Fallback to data.json also failed:', fallbackError.message);
      }
    }
    return null;
  }
};

// Extract instrument keys for a symbol
const getInstrumentKeys = (data) => {
  const keys = [];
  
  // Index instrument key
  if (data.instrument_key) {
    keys.push(data.instrument_key);
  }
  
  // Future instrument key
  if (data.future_instrument_key) {
    keys.push(data.future_instrument_key);
  }
  
  // CE options: MIN, BASE, MAX, HOI
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const ceKey = data.ce_summary?.[level]?.instrument_key;
    if (ceKey) keys.push(ceKey);
  });
  
  // PE options: MIN, BASE, MAX, HOI
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const peKey = data.pe_summary?.[level]?.instrument_key;
    if (peKey) keys.push(peKey);
  });
  
  return keys.filter(Boolean);
};

// State - now supports multiple symbols
let server = null;
let wss = null;
let updateTimer = null;
let extraUpdateTimer = null;
let currentExtraLTPs = {}; // { instrument_key: { ltp, average_price } }
const connectedClients = new Set();

// Symbol-specific state
const symbolData = new Map(); // Map<symbol, { data, ltps, averagePrices, extraLTPs, instrumentKeys }>

// Initialize state for a symbol
const initializeSymbol = (symbol) => {
  if (!symbolData.has(symbol)) {
    symbolData.set(symbol, {
      data: null,
      ltps: {},
      averagePrices: {},
      extraLTPs: {},
      instrumentKeys: []
    });
  }
  return symbolData.get(symbol);
};

// Initialize LTPs from CP values for a specific symbol
const initializeLTPsFromCP = (symbol) => {
  const state = symbolData.get(symbol);
  if (!state || !state.data) return;
  
  const data = state.data;
  
  // Index CP
  if (data.cash_data?.CP && data.instrument_key) {
    state.ltps[data.instrument_key] = data.cash_data.CP;
  }
  
  // Future instrument - initialize with a reasonable default or from data if available
  if (data.future_instrument_key) {
    // Use cash CP as initial value for future (they're usually close)
    state.ltps[data.future_instrument_key] = data.cash_data?.CP || 0;
  }
  
  // CE options
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const ce = data.ce_summary?.[level];
    if (ce?.CP && ce?.instrument_key) {
      state.ltps[ce.instrument_key] = ce.CP;
    }
  });
  
  // PE options
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const pe = data.pe_summary?.[level];
    if (pe?.CP && pe?.instrument_key) {
      state.ltps[pe.instrument_key] = pe.CP;
    }
  });
  
  console.log(`[Server] Initialized LTPs from CP for ${symbol}:`, Object.keys(state.ltps).length, 'instruments');
};

// Build enriched data with LTPs for a specific symbol
const buildEnrichedData = (symbol) => {
  const state = symbolData.get(symbol);
  if (!state || !state.data) return null;
  
  const data = state.data;
  const ltps = state.ltps;
  const averagePrices = state.averagePrices;
  
  const futureLtp = ltps[data.future_instrument_key] || data.cash_data?.CP || null;
  console.log(`[Server] Building enriched data for ${symbol}:`, {
    futureKey: data.future_instrument_key,
    futureLtpValue: futureLtp,
    hasInLTPs: !!ltps[data.future_instrument_key]
  });
  
  const enriched = {
    ...data,
    ltp: ltps[data.instrument_key] || data.cash_data?.CP || null,
    future_ltp: futureLtp,
    ce_summary: {},
    pe_summary: {}
  };
  
  // Enrich CE options
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const ce = data.ce_summary?.[level];
    if (ce) {
      const ltpValue = ltps[ce.instrument_key];
      const avgValue = averagePrices[ce.instrument_key];
      console.log(`[Server] Enriching ${symbol} CE ${level}:`, {
        key: ce.instrument_key,
        cp: ce.CP,
        ltp: ltpValue,
        avg: avgValue,
        found: !!ltpValue
      });
      enriched.ce_summary[level] = {
        ...ce,
        ltp: ltpValue || ce.CP || null,
        average_price: avgValue || null
      };
    }
  });
  
  // Enrich PE options
  ['MIN', 'BASE', 'MAX', 'HOI'].forEach(level => {
    const pe = data.pe_summary?.[level];
    if (pe) {
      const ltpValue = ltps[pe.instrument_key];
      const avgValue = averagePrices[pe.instrument_key];
      console.log(`[Server] Enriching ${symbol} PE ${level}:`, {
        key: pe.instrument_key,
        cp: pe.CP,
        ltp: ltpValue,
        avg: avgValue,
        found: !!ltpValue
      });
      enriched.pe_summary[level] = {
        ...pe,
        ltp: ltpValue || pe.CP || null,
        average_price: avgValue || null
      };
    }
  });
  
  return enriched;
};

// Broadcast to all connected WebSocket clients
const broadcast = () => {
  // Build enriched data for all loaded symbols
  const symbolsData = {};
  for (const [symbol, state] of symbolData.entries()) {
    if (state.data) {
      symbolsData[symbol] = buildEnrichedData(symbol);
    }
  }
  
  const message = JSON.stringify({
    type: 'market_data',
    symbols: symbolsData,
    timestamp: new Date().toISOString()
  });
  
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
};

// Fetch and update LTPs for all loaded symbols
const updateLTPs = async () => {
  if (symbolData.size === 0) {
    console.warn('[Server] No symbols loaded, skipping update');
    return;
  }
  
  // Collect all instrument keys from all symbols
  const allKeys = [];
  const keyToSymbol = new Map(); // Track which symbol each key belongs to
  
  for (const [symbol, state] of symbolData.entries()) {
    if (state.data) {
      const keys = getInstrumentKeys(state.data);
      keys.forEach(key => {
        allKeys.push(key);
        keyToSymbol.set(key, symbol);
      });
    }
  }
  
  console.log(`[Server] Updating LTPs for ${allKeys.length} instruments across ${symbolData.size} symbols`);
  
  const ltpMap = await fetchLTP(allKeys);
  
  // Update LTPs and averagePrices for each symbol
  Object.entries(ltpMap).forEach(([key, data]) => {
    const symbol = keyToSymbol.get(key);
    if (!symbol) return;
    
    const state = symbolData.get(symbol);
    if (!state) return;
    
    if (data && typeof data === 'object') {
      state.ltps[key] = data.ltp;
      state.averagePrices[key] = data.average_price;
      console.log(`[Server] Updated ${symbol}: ${key} = LTP: ${data.ltp}, Avg: ${data.average_price}`);
    } else {
      // Fallback
      state.ltps[key] = data;
      console.log(`[Server] Updated ${symbol} LTP: ${key} = ${data}`);
    }
  });
  
  // Broadcast to all clients
  if (connectedClients.size > 0) {
    broadcast();
    console.log(`[Server] Broadcasted update to ${connectedClients.size} clients`);
  }
};

// Start periodic updates
const startMarketFeed = () => {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
  
  // Initialize LTPs from CP for all loaded symbols
  for (const symbol of symbolData.keys()) {
    initializeLTPsFromCP(symbol);
  }
  
  // Initial update
  updateLTPs();
  
  // Periodic updates
  updateTimer = setInterval(updateLTPs, UPDATE_INTERVAL_MS);
  console.log(`[Server] Market feed started (${UPDATE_INTERVAL_MS}ms interval)`);
};

// Stop periodic updates
const stopMarketFeed = () => {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
    console.log('[Server] Market feed stopped');
  }
};

// Update extra LTPs
const updateExtraLTPs = async (instrumentKeys) => {
  if (!instrumentKeys || instrumentKeys.length === 0) {
    console.warn('[Server] No instrument keys for extra LTP update');
    return;
  }

  console.log(`[Server] Updating extra quotes for ${instrumentKeys.length} instruments`);
  
  const quoteMap = await fetchExtraLTP(instrumentKeys);
  
  // Update current extra LTPs (now includes average_price)
  Object.entries(quoteMap).forEach(([key, value]) => {
    currentExtraLTPs[key] = value;
    console.log(`[Server] Updated extra quote: ${key} -> LTP: ${value.ltp}, Avg: ${value.average_price || 'N/A'}`);
  });
  
  // Broadcast to clients (manual send since broadcast() is for main feed)
  if (connectedClients.size > 0) {
    const message = JSON.stringify({
      type: 'extra_ltp_update',
      data: currentExtraLTPs,
      timestamp: new Date().toISOString()
    });
    
    connectedClients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });

    console.log(`[Server] Broadcasted extra quote update to ${connectedClients.size} clients`);
  }
};

// Start extra LTP updates
const startExtraLTPUpdates = (instrumentKeys) => {
  if (extraUpdateTimer) {
    clearInterval(extraUpdateTimer);
  }
  
  // Initial update
  updateExtraLTPs(instrumentKeys);
  
  // Periodic updates
  extraUpdateTimer = setInterval(() => updateExtraLTPs(instrumentKeys), EXTRA_LTP_INTERVAL);
  console.log(`[Server] Extra LTP updates started (${EXTRA_LTP_INTERVAL}ms interval)`);
};

// Stop extra LTP updates
const stopExtraLTPUpdates = () => {
  if (extraUpdateTimer) {
    clearInterval(extraUpdateTimer);
    extraUpdateTimer = null;
    currentExtraLTPs = {};
    console.log('[Server] Extra LTP updates stopped');
  }
};

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    clients: connectedClients.size,
    rateLimits: getRateLimitStatus()
  });
});

app.get('/api/nifty', (req, res) => {
  const enrichedData = buildEnrichedData();
  res.json({
    status: 'success',
    data: enrichedData
  });
});

app.get('/api/extra-options', async (req, res) => {
  try {
    const currentPrice = parseFloat(req.query.currentPrice);
    
    if (!currentPrice || isNaN(currentPrice)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid currentPrice parameter'
      });
    }

    const extraOptions = await getExtraOptions(currentPrice, 5);
    
    res.json({
      status: 'success',
      data: extraOptions
    });
  } catch (error) {
    console.error('[Server] Error fetching extra options:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start Server Function
const startServer = async () => {
  try {
    // Load data for both NIFTY and BANKNIFTY
    console.log('[Server] Loading symbol data...');
    
    const niftyState = initializeSymbol('NIFTY');
    niftyState.data = await loadSymbolData('NIFTY');
    
    const bankNiftyState = initializeSymbol('BANKNIFTY');
    bankNiftyState.data = await loadSymbolData('BANKNIFTY');
    
    if (!niftyState.data && !bankNiftyState.data) {
      throw new Error('Failed to load any symbol data');
    }
    
    console.log('[Server] Loaded symbols:', Array.from(symbolData.keys()).join(', '));

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`[Server] HTTP server running on http://localhost:${PORT}`);
      console.log(`[Server] WebSocket will be available on ws://localhost:${PORT}`);
    });

    // WebSocket server
    wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  connectedClients.add(ws);
  
  // Send initial data for all symbols
  const symbolsData = {};
  for (const [symbol, state] of symbolData.entries()) {
    if (state.data) {
      symbolsData[symbol] = buildEnrichedData(symbol);
    }
  }
  
  if (Object.keys(symbolsData).length > 0) {
    ws.send(JSON.stringify({
      type: 'initial_data',
      symbols: symbolsData,
      timestamp: new Date().toISOString()
    }));
  }
  
  // Start market feed if first client
  if (connectedClients.size === 1) {
    startMarketFeed();
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Received:', data);
      
      // Handle client messages
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      } else if (data.type === 'request_extra_ltp') {
        // Start extra LTP updates
        const instrumentKeys = data.instrumentKeys || [];
        if (instrumentKeys.length > 0) {
          startExtraLTPUpdates(instrumentKeys);
          ws.send(JSON.stringify({ 
            type: 'extra_ltp_started', 
            count: instrumentKeys.length,
            timestamp: new Date().toISOString() 
          }));
        }
      } else if (data.type === 'stop_extra_ltp') {
        // Stop extra LTP updates
        stopExtraLTPUpdates();
        ws.send(JSON.stringify({ 
          type: 'extra_ltp_stopped', 
          timestamp: new Date().toISOString() 
        }));
      }
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error.message);
    }
  });
  
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    connectedClients.delete(ws);
    
    // Stop market feed if no clients
    if (connectedClients.size === 0) {
      stopMarketFeed();
    }
  });
  
  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error.message);
  });
  });

    console.log('[Server] Commodity Market Data Server initialized');
    console.log('[Server] Waiting for WebSocket connections...');
    console.log('[Server] Press Ctrl+C to stop');

  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Server] Shutting down gracefully...');
  stopMarketFeed();
  
  // Force exit after 2 seconds if graceful shutdown hangs
  const forceExitTimer = setTimeout(() => {
    console.log('[Server] Force closing...');
    process.exit(0);
  }, 2000);
  
  // Close WebSocket server
  wss.clients.forEach(client => {
    client.close();
  });
  
  wss.close(() => {
    server.close(() => {
      clearTimeout(forceExitTimer);
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });
};

// Handle Ctrl+C on Windows and Unix
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Windows-specific: handle Ctrl+C
if (process.platform === 'win32') {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}


