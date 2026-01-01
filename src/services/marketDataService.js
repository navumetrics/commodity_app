/* eslint-disable no-console */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class MarketDataService {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.listeners = new Set();
    this.connectionListeners = new Set();
    this.isConnected = false;
    this.latestData = null;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    // Prevent duplicate connections
    if (this.ws) {
      if (this.ws.readyState === WebSocket.CONNECTING) {
        console.log('[MarketData] Already connecting...');
        return;
      }
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log('[MarketData] Already connected');
        return;
      }
    }

    console.log('[MarketData] Connecting to', WS_URL);
    
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[MarketData] Connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange(true);
        
        // Expose WebSocket to window for TestIndexCard
        window.marketDataWs = this.ws;
        
        // Send ping every 30s to keep connection alive
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'initial_data' || message.type === 'market_data') {
            // New format: message.symbols contains all symbols' data
            if (message.symbols) {
              this.latestData = message.symbols;
              console.log('[MarketData] Received update', {
                type: message.type,
                symbols: Object.keys(message.symbols),
                timestamp: message.timestamp
              });
              this.notifyListeners(message.symbols);
            } else {
              // Fallback for old format
              this.latestData = message.data;
              console.log('[MarketData] Received update (old format)', {
                type: message.type,
                symbol: message.data?.symbol,
                timestamp: message.timestamp
              });
              this.notifyListeners(message.data);
            }
          } else if (message.type === 'pong') {
            // Heartbeat response
          }
        } catch (error) {
          console.error('[MarketData] Message parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[MarketData] WebSocket error');
      };

      this.ws.onclose = (event) => {
        console.log('[MarketData] Disconnected', event.code, event.reason);
        this.isConnected = false;
        this.ws = null;
        this.notifyConnectionChange(false);
        this.stopHeartbeat();
        
        // Only reconnect if not a normal closure
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('[MarketData] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('[MarketData] Disconnecting...');
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Remove event handlers to prevent reconnection
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[MarketData] Max reconnect attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`[MarketData] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat ping
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  /**
   * Stop heartbeat ping
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Subscribe to market data updates
   * @param {Function} callback - Called with updated data
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Send latest data immediately if available
    if (this.latestData) {
      callback(this.latestData);
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   * @param {Function} callback - Called with connection status (boolean)
   * @returns {Function} Unsubscribe function
   */
  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    
    // Send current status immediately
    callback(this.isConnected);

    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  /**
   * Notify all data listeners
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[MarketData] Listener error:', error);
      }
    });
  }

  /**
   * Notify all connection listeners
   */
  notifyConnectionChange(isConnected) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('[MarketData] Connection listener error:', error);
      }
    });
  }

  /**
   * Get latest data
   */
  getLatestData() {
    return this.latestData;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const marketDataService = new MarketDataService();

export default marketDataService;
