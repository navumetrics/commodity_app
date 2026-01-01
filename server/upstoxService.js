/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config();

const UPSTOX_API_BASE = process.env.UPSTOX_API_BASE || 'https://api.upstox.com/v2';
const ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN;
const MAX_KEYS_PER_REQUEST = 500; // Upstox limit

// Rate limiting state
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
    console.warn('[Upstox] Minute rate limit reached, skipping request');
    return false;
  }

  if (thirtyMinReqCount >= MAX_REQUESTS_PER_30MIN) {
    console.warn('[Upstox] 30-minute rate limit reached, skipping request');
    return false;
  }

  return true;
};

/**
 * Fetch LTP data from Upstox for given instrument keys
 * @param {string[]} instrumentKeys - Array of instrument keys
 * @returns {Promise<Object>} Map of instrument_key -> LTP
 */
export const fetchLTP = async (instrumentKeys) => {
  if (!instrumentKeys || instrumentKeys.length === 0) {
    return {};
  }

  if (!ACCESS_TOKEN) {
    console.error('[Upstox] No access token configured');
    return {};
  }

  // Check rate limits
  if (!checkRateLimit()) {
    return {};
  }

  // Check backoff
  if (isBackingOff) {
    console.warn('[Upstox] In backoff mode, skipping request');
    return {};
  }

  // Limit keys per request
  const keys = instrumentKeys.slice(0, MAX_KEYS_PER_REQUEST);
  
  // Build URL
  const url = `${UPSTOX_API_BASE}/market-quote/quotes?instrument_key=${keys.join(',')}`;

  console.log(`[Upstox] Fetching Quotes for ${keys.length} instruments`);
  console.log(`[Upstox] Sample keys:`, keys.slice(0, 3));
  console.log(`[Upstox] URL:`, url);

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
      console.warn(`[Upstox] 429 Rate limit hit, backing off for ${backoffMs}ms`);
      
      // Schedule backoff end
      setTimeout(() => {
        isBackingOff = false;
        backoffMs = 0;
        console.log('[Upstox] Backoff ended, resuming requests');
      }, backoffMs);
      
      return {};
    }

    if (!response.ok) {
      console.error(`[Upstox] HTTP error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[Upstox] Error response:`, errorText);
      return {};
    }

    // Increment counters
    minuteReqCount++;
    thirtyMinReqCount++;

    const data = await response.json();
    
    console.log(`[Upstox] Raw response:`, JSON.stringify(data, null, 2));
    
    // Parse response
    // Upstox returns: { "NSE_FO:NIFTY25DEC25700CE": { last_price: 467.7, average_price: 450.5, instrument_token: "NSE_FO|65559" } }
    // We need to use instrument_token (NSE_FO|65559) as the key, not the response key
    const ltpMap = {};
    
    if (data.status === 'success' && data.data) {
      Object.entries(data.data).forEach(([responseKey, value]) => {
        const ltp = value.last_price || value.ltp;
        const averagePrice = value.average_price;
        const instrumentToken = value.instrument_token; // This is the key in data.json!
        
        if (typeof ltp === 'number' && instrumentToken) {
          ltpMap[instrumentToken] = {
            ltp: ltp,
            average_price: averagePrice
          };
          console.log(`[Upstox] Parsed: ${responseKey} -> ${instrumentToken} = LTP: ${ltp}, Avg: ${averagePrice}`);
        } else {
          console.warn(`[Upstox] No LTP or token for key: ${responseKey}`, value);
        }
      });
    } else {
      console.error(`[Upstox] Unexpected response format:`, data);
    }

    console.log(`[Upstox] Received ${Object.keys(ltpMap).length} LTP values`);
    return ltpMap;

  } catch (error) {
    console.error('[Upstox] Fetch error:', error.message);
    return {};
  }
};

/**
 * Get current rate limit status
 */
export const getRateLimitStatus = () => ({
  minuteCount: minuteReqCount,
  minuteLimit: MAX_REQUESTS_PER_MINUTE,
  thirtyMinCount: thirtyMinReqCount,
  thirtyMinLimit: MAX_REQUESTS_PER_30MIN,
  isBackingOff,
  backoffMs
});
