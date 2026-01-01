/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config();

const UPSTOX_API_BASE = process.env.UPSTOX_API_BASE || 'https://api.upstox.com/v2';
const ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN;
const MAX_KEYS_PER_REQUEST = 500; // Upstox limit

// Rate limiting state (separate from main service)
let minuteBucketStart = Date.now();
let minuteReqCount = 0;
let thirtyMinBucketStart = Date.now();
let thirtyMinReqCount = 0;

const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 12;
const MAX_REQUESTS_PER_30MIN = parseInt(process.env.MAX_REQUESTS_PER_30MIN) || 500;

// Backoff state
let isBackingOff = false;
let backoffMs = 0;
const BACKOFF_START_MS = 60000; // 60s
const BACKOFF_MAX_MS = 300000; // 5 min

/**
 * Check and update rate limit counters
 * @returns {boolean} true if request is allowed
 */
const checkRateLimit = () => {
  const now = Date.now();

  // Reset minute bucket
  if (now - minuteBucketStart >= 60000) {
    minuteBucketStart = now;
    minuteReqCount = 0;
  }

  // Reset 30-min bucket
  if (now - thirtyMinBucketStart >= 1800000) {
    thirtyMinBucketStart = now;
    thirtyMinReqCount = 0;
  }

  // Check limits
  if (minuteReqCount >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('[UpstoxExtra] Minute rate limit reached, skipping request');
    return false;
  }

  if (thirtyMinReqCount >= MAX_REQUESTS_PER_30MIN) {
    console.warn('[UpstoxExtra] 30-minute rate limit reached, skipping request');
    return false;
  }

  return true;
};

/**
 * Fetch full quote data from Upstox for extra options (includes LTP and average price)
 * @param {string[]} instrumentKeys - Array of instrument keys
 * @returns {Promise<Object>} Map of instrument_key -> { ltp, average_price }
 */
export const fetchExtraLTP = async (instrumentKeys) => {
  if (!instrumentKeys || instrumentKeys.length === 0) {
    return {};
  }

  if (!ACCESS_TOKEN) {
    console.error('[UpstoxExtra] No access token configured');
    return {};
  }

  // Check rate limits
  if (!checkRateLimit()) {
    return {};
  }

  // Check backoff
  if (isBackingOff) {
    console.warn('[UpstoxExtra] In backoff mode, skipping request');
    return {};
  }

  // Limit keys per request
  const keys = instrumentKeys.slice(0, MAX_KEYS_PER_REQUEST);
  
  // Build URL - using quotes endpoint to get average_price
  // Use instrument_key directly (numeric format like NSE_FO|65559)
  const url = `${UPSTOX_API_BASE}/market-quote/quotes?instrument_key=${keys.join(',')}`;

  console.log(`[UpstoxExtra] Fetching quotes for ${keys.length} extra instruments`);
  console.log(`[UpstoxExtra] Sample keys:`, keys.slice(0, 3));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    // Handle 429 rate limit
    if (response.status === 429) {
      isBackingOff = true;
      backoffMs = backoffMs ? Math.min(backoffMs * 2, BACKOFF_MAX_MS) : BACKOFF_START_MS;
      console.warn(`[UpstoxExtra] 429 Rate limit hit, backing off for ${backoffMs}ms`);
      
      // Schedule backoff end
      setTimeout(() => {
        isBackingOff = false;
        backoffMs = 0;
        console.log('[UpstoxExtra] Backoff ended, resuming requests');
      }, backoffMs);
      
      return {};
    }

    if (!response.ok) {
      console.error(`[UpstoxExtra] HTTP error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[UpstoxExtra] Error response:`, errorText);
      return {};
    }

    // Increment counters
    minuteReqCount++;
    thirtyMinReqCount++;

    const data = await response.json();
    
    // Parse response - use instrument_token as key (like main service)
    const quoteMap = {};
    
    if (data.status === 'success' && data.data) {
      Object.entries(data.data).forEach(([responseKey, value]) => {
        const ltp = value.last_price || value.ltp;
        const averagePrice = value.ohlc?.vwap || value.average_price;
        const instrumentToken = value.instrument_token; // Use this as the key!
        
        if (typeof ltp === 'number' && instrumentToken) {
          quoteMap[instrumentToken] = {
            ltp,
            average_price: averagePrice || null
          };
          console.log(`[UpstoxExtra] Parsed: ${responseKey} -> ${instrumentToken} -> LTP: ${ltp}, Avg: ${averagePrice || 'N/A'}`);
        }
      });
    } else {
      console.error(`[UpstoxExtra] Unexpected response format:`, data);
    }

    console.log(`[UpstoxExtra] Received ${Object.keys(quoteMap).length} quote values`);
    return quoteMap;

  } catch (error) {
    console.error('[UpstoxExtra] Fetch error:', error.message);
    return {};
  }
};

/**
 * Get current rate limit status
 */
export const getRateLimitStatusExtra = () => ({
  minuteCount: minuteReqCount,
  minuteLimit: MAX_REQUESTS_PER_MINUTE,
  thirtyMinCount: thirtyMinReqCount,
  thirtyMinLimit: MAX_REQUESTS_PER_30MIN,
  isBackingOff,
  backoffMs
});
