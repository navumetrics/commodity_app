/* eslint-disable no-console */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = process.env.MONGO_COLLECTION;

let client = null;
let db = null;
let collection = null;

/**
 * Connect to MongoDB
 */
export const connectMongo = async () => {
  if (client && client.topology && client.topology.isConnected()) {
    console.log('[MongoDB] Already connected');
    return { client, db, collection };
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log(`[MongoDB] Connected to ${DB_NAME}.${COLLECTION_NAME}`);
    return { client, db, collection };
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
};

/**
 * Get extra CE/PE options above and below current price
 * @param {string} symbol - Symbol to fetch options for (e.g., 'NIFTY', 'BANKNIFTY')
 * @param {number} currentPrice - Current price
 * @param {number} count - Number of options to fetch above and below (default 3)
 * @returns {Promise<Object>} Object with above and below options
 */
export const getExtraOptions = async (symbol, currentPrice, count = 3) => {
  try {
    // Connect to MongoDB if not already connected
    if (!client || !client.topology || !client.topology.isConnected()) {
      client = new MongoClient(MONGO_URI);
      await client.connect();
      console.log(`[MongoDB] Connected for extra options`);
    }

    // Access Options database and symbol-specific collection
    const optionsDb = client.db('Options');
    const symbolCollection = optionsDb.collection(symbol);

    // Fetch CE options above current price
    const ceAbove = await symbolCollection
      .find({
        optionType: 'CE',
        strikePrice: { $gt: currentPrice }
      })
      .sort({ strikePrice: 1 })
      .limit(count)
      .toArray();

    // Fetch PE options above current price
    const peAbove = await symbolCollection
      .find({
        optionType: 'PE',
        strikePrice: { $gt: currentPrice }
      })
      .sort({ strikePrice: 1 })
      .limit(count)
      .toArray();

    // Fetch CE options below current price
    const ceBelow = await symbolCollection
      .find({
        optionType: 'CE',
        strikePrice: { $lt: currentPrice }
      })
      .sort({ strikePrice: -1 })
      .limit(count)
      .toArray();

    // Fetch PE options below current price
    const peBelow = await symbolCollection
      .find({
        optionType: 'PE',
        strikePrice: { $lt: currentPrice }
      })
      .sort({ strikePrice: -1 })
      .limit(count)
      .toArray();

    console.log(`[MongoDB] Fetched extra options for ${symbol} at price ${currentPrice}:`, {
      ceAbove: ceAbove.length,
      peAbove: peAbove.length,
      ceBelow: ceBelow.length,
      peBelow: peBelow.length
    });

    // Helper function to create pairs from CE and PE arrays
    const createPairs = (ceArray, peArray) => {
      const strikeMap = new Map();
      
      // Add all CE options to map
      ceArray.forEach(ce => {
        if (!strikeMap.has(ce.strikePrice)) {
          strikeMap.set(ce.strikePrice, { ce: null, pe: null });
        }
        strikeMap.get(ce.strikePrice).ce = formatOption(ce);
      });
      
      // Add all PE options to map
      peArray.forEach(pe => {
        if (!strikeMap.has(pe.strikePrice)) {
          strikeMap.set(pe.strikePrice, { ce: null, pe: null });
        }
        strikeMap.get(pe.strikePrice).pe = formatOption(pe);
      });
      
      // Get all unique strikes and sort them
      const strikes = Array.from(strikeMap.keys()).sort((a, b) => a - b);
      
      // Convert map to array of pairs in sorted order
      const pairs = strikes.map(strike => {
        const value = strikeMap.get(strike);
        
        // Create placeholder for missing CE or PE
        const cePlaceholder = {
          PRICE: strike,
          OI: 0,
          GA: 0,
          VA: 0,
          CP: 0,
          MAXA: 0,
          instrument_key: '',
          optionType: 'CE'
        };
        
        const pePlaceholder = {
          PRICE: strike,
          OI: 0,
          GA: 0,
          VA: 0,
          CP: 0,
          MAXA: 0,
          instrument_key: '',
          optionType: 'PE'
        };
        
        return {
          strike,
          ce: value.ce || cePlaceholder,
          pe: value.pe || pePlaceholder
        };
      });
      
      return pairs;
    };

    // Create pairs for above and below
    let aboveOptions = createPairs(ceAbove, peAbove);
    let belowOptions = createPairs(ceBelow, peBelow);
    
    // Sort above options in ascending order (closest to current price first)
    aboveOptions.sort((a, b) => a.strike - b.strike);
    
    // Sort below options in descending order (closest to current price first)
    belowOptions.sort((a, b) => b.strike - a.strike);

    console.log(`[MongoDB] Created ${aboveOptions.length} pairs above, ${belowOptions.length} pairs below`);

    return {
      above: aboveOptions,
      below: belowOptions,
      currentPrice
    };
  } catch (error) {
    console.error('[MongoDB] Error fetching extra options:', error.message);
    throw error;
  }
};

/**
 * Format MongoDB option document to match our data structure
 */
const formatOption = (doc) => {
  // Build trading symbol for Upstox API: NSE_FO|NIFTY25DEC{strike}{CE/PE}
  // NOTE: This format might need adjustment based on actual Upstox symbol format
  // If Upstox symbols are different, update MongoDB with correct trading_symbol field
  const strike = doc.strikePrice;
  const optionType = doc.optionType;
  const tradingSymbol = doc.trading_symbol || `NSE_FO|NIFTY25DEC${strike}${optionType}`;
  
  return {
    PRICE: doc.strikePrice,
    OI: doc.openInterest || 0,
    GA: doc.ga || 0,
    VA: doc.va || 0,
    CP: doc.closePrice || 0,
    MAXA: doc.maxa || 0,
    instrument_key: doc.instrument_key || '', // Numeric key from MongoDB
    trading_symbol: tradingSymbol, // Symbol-based key for Upstox API
    optionType: doc.optionType
  };
};


/**
 * Get symbol data from Stocks database
 * @param {string} symbol - Symbol to fetch (e.g., 'NIFTY', 'BANKNIFTY')
 * @returns {Promise<Object>} Symbol document with ce_summary, pe_summary, etc.
 */
export const getSymbolData = async (symbol = 'NIFTY') => {
  try {
    const STOCKS_DB_NAME = process.env.STOCKS_DB_NAME;
    const STOCKS_COLLECTION = process.env.STOCKS_COLLECTION;
    
    // Connect to MongoDB if not already connected
    if (!client || !client.topology || !client.topology.isConnected()) {
      client = new MongoClient(MONGO_URI);
      await client.connect();
      console.log(`[MongoDB] Connected for Stocks data`);
    }
    
    // Access Stocks database and collection
    const stocksDb = client.db(STOCKS_DB_NAME);
    const stocksCollection = stocksDb.collection(STOCKS_COLLECTION);
    
    // Find symbol document
    const symbolDoc = await stocksCollection.findOne({ symbol: symbol });
    
    if (!symbolDoc) {
      console.error(`[MongoDB] No ${symbol} document found in ${STOCKS_DB_NAME}.${STOCKS_COLLECTION}`);
      return null;
    }
    
    console.log(`[MongoDB] Fetched ${symbol} data from ${STOCKS_DB_NAME}.${STOCKS_COLLECTION}`);
    return symbolDoc;
    
  } catch (error) {
    console.error(`[MongoDB] Error fetching ${symbol} data:`, error.message);
    return null;
  }
};

// Keep backward compatibility
export const getNiftyData = async () => getSymbolData('NIFTY');

/**
 * Close MongoDB connection
 */
export const closeMongo = async () => {
  if (client) {
    await client.close();
    console.log('[MongoDB] Connection closed');
  }
};
