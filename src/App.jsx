import { useState, useEffect } from 'react';
import { StockCard } from './components/StockCard';
import { IndexCard } from './components/IndexCard';
import { TestIndexCard } from './components/TestIndexCard';
import { SymbolCard } from './components/SymbolCard';
import { SimpleStockCard } from './components/SimpleStockCard';
import { Wifi, WifiOff, Search, X } from 'lucide-react';
import marketDataService from './services/marketDataService';

console.log('🚀 [App.jsx] Module loaded!');

const mockStocks = [
  {
    id: 1,
    symbol: 'SILVERM',
    name: 'Silver Mini',
    price: 74250.00,
    change: 850.00,
    changePercent: 1.16,
    volume: '12.8K',
    marketCap: 'MCX',
    high: 74580.00,
    low: 73200.00,
    open: 73400.00,
    previousClose: 73400.00,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 82500.00,
    yearLow: 62100.00,
  },
  {
    id: 2,
    symbol: 'CRUDEOILM',
    name: 'Crude Oil Mini',
    price: 6245.00,
    change: -85.50,
    changePercent: -1.35,
    volume: '45.2K',
    marketCap: 'MCX',
    high: 6330.00,
    low: 6210.00,
    open: 6315.00,
    previousClose: 6330.50,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 7850.00,
    yearLow: 5420.00,
  },
  {
    id: 3,
    symbol: 'NATURALGAS',
    name: 'Natural Gas Mini',
    price: 268.50,
    change: 12.30,
    changePercent: 4.80,
    volume: '89.5K',
    marketCap: 'MCX',
    high: 272.80,
    low: 256.20,
    open: 258.40,
    previousClose: 256.20,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 385.00,
    yearLow: 165.50,
  },
  {
    id: 4,
    symbol: 'GOLDPETAL',
    name: 'Gold Petal',
    price: 7245.00,
    change: 45.00,
    changePercent: 0.62,
    volume: '8.9K',
    marketCap: 'MCX',
    high: 7268.00,
    low: 7198.00,
    open: 7210.00,
    previousClose: 7200.00,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 7680.00,
    yearLow: 6250.00,
  },
  {
    id: 5,
    symbol: 'ALUMINIUM',
    name: 'Aluminium',
    price: 234.85,
    change: -2.15,
    changePercent: -0.91,
    volume: '34.7K',
    marketCap: 'MCX',
    high: 237.50,
    low: 233.80,
    open: 236.20,
    previousClose: 237.00,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 265.00,
    yearLow: 198.50,
  },
  {
    id: 6,
    symbol: 'COPPER',
    name: 'Copper',
    price: 785.60,
    change: 18.40,
    changePercent: 2.40,
    volume: '28.3K',
    marketCap: 'MCX',
    high: 792.50,
    low: 768.20,
    open: 770.00,
    previousClose: 767.20,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 865.00,
    yearLow: 685.00,
  },
  {
    id: 7,
    symbol: 'ZINC',
    name: 'Zinc',
    price: 278.45,
    change: 5.25,
    changePercent: 1.92,
    volume: '19.6K',
    marketCap: 'MCX',
    high: 281.20,
    low: 273.80,
    open: 274.50,
    previousClose: 273.20,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 312.00,
    yearLow: 235.50,
  },
  {
    id: 8,
    symbol: 'LEAD',
    name: 'Lead',
    price: 198.75,
    change: -3.50,
    changePercent: -1.73,
    volume: '15.2K',
    marketCap: 'MCX',
    high: 202.80,
    low: 197.50,
    open: 201.50,
    previousClose: 202.25,
    pe: 'N/A',
    eps: 'Futures',
    yearHigh: 225.00,
    yearLow: 175.00,
  },
];

export default function App() {
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('nifty'); // 'stocks', 'indices', 'test', 'nifty', 'banknifty', or stock symbol
  const [isConnected, setIsConnected] = useState(false);
  const [symbolsData, setSymbolsData] = useState({}); // { NIFTY: {...}, BANKNIFTY: {...}, ABB: {...} }
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [openedStockTabs, setOpenedStockTabs] = useState([]); // Array of stock symbols with open tabs

  // Connect to WebSocket on mount
  useEffect(() => {
    console.log('[App] Connecting to WebSocket...');
    marketDataService.connect();

    const unsubscribeData = marketDataService.subscribe((data) => {
      console.log('[App] Received data update:', {
        symbols: Object.keys(data || {}),
        timestamp: new Date().toISOString()
      });
      setSymbolsData(data || {});
    });

    const unsubscribeConnection = marketDataService.onConnectionChange((connected) => {
      console.log('[App] Connection status changed:', connected);
      setIsConnected(connected);
    });

    return () => {
      console.log('[App] Cleaning up WebSocket...');
      unsubscribeData();
      unsubscribeConnection();
      marketDataService.disconnect();
    };
  }, []);

  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoadingStocks(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_URL}/api/stocks`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setStocks(data.data);
          console.log(`[App] Loaded ${data.count} stocks`);
        }
      } catch (error) {
        console.error('[App] Error fetching stocks:', error);
      } finally {
        setIsLoadingStocks(false);
      }
    };

    fetchStocks();
  }, []);

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open a stock tab
  const openStockTab = (stockSymbol) => {
    if (!openedStockTabs.includes(stockSymbol)) {
      setOpenedStockTabs(prev => [...prev, stockSymbol]);
    }
    setActiveTab(stockSymbol);
  };

  // Close a stock tab
  const closeStockTab = (stockSymbol) => {
    setOpenedStockTabs(prev => prev.filter(s => s !== stockSymbol));
    // If closing the active tab, switch to stocks tab
    if (activeTab === stockSymbol) {
      setActiveTab('stocks');
    }
  };

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-400 mb-2">NSE Commodity Market Dashboard</h1>
            
            {/* Connection Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === 'stocks'
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Stock Cards
            {activeTab === 'stocks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('nifty')}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === 'nifty'
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            NIFTY
            {activeTab === 'nifty' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('banknifty')}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === 'banknifty'
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Bank Nifty
            {activeTab === 'banknifty' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('indices')}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === 'indices'
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Index Cards (Old)
            {activeTab === 'indices' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
              activeTab === 'test'
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Test (Old)
            {activeTab === 'test' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
            )}
          </button>

          {/* Dynamic Stock Tabs */}
          {openedStockTabs.map((stockSymbol) => (
            <button
              key={stockSymbol}
              onClick={() => setActiveTab(stockSymbol)}
              className={`px-6 py-3 font-semibold transition-all duration-200 relative flex items-center gap-2 ${
                activeTab === stockSymbol
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {stockSymbol}
              {activeTab === stockSymbol && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
              )}
              {/* Close button */}
              <X
                className="w-4 h-4 hover:text-red-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  closeStockTab(stockSymbol);
                }}
              />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'stocks' && (
          <div>
            {/* Search Box */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Showing {filteredStocks.length} of {stocks.length} stocks
              </div>
            </div>

            {/* Loading State */}
            {isLoadingStocks && (
              <div className="text-center text-slate-400 py-10">Loading stocks...</div>
            )}

            {/* Stock Cards Grid */}
            {!isLoadingStocks && filteredStocks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStocks.map((stock) => (
                  <SimpleStockCard 
                    key={stock.symbol} 
                    stock={stock} 
                    onClick={() => openStockTab(stock.symbol)}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoadingStocks && filteredStocks.length === 0 && stocks.length > 0 && (
              <div className="text-center text-slate-400 py-10">
                No stocks found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {activeTab === 'nifty' && (
          <div className="max-w-full">
            {symbolsData.NIFTY ? (
              <SymbolCard indexData={symbolsData.NIFTY} symbol="NIFTY" />
            ) : (
              <div className="text-center text-slate-400 py-10">Loading NIFTY Data...</div>
            )}
          </div>
        )}

        {activeTab === 'banknifty' && (
          <div className="max-w-full">
            {symbolsData.BANKNIFTY ? (
              <SymbolCard indexData={symbolsData.BANKNIFTY} symbol="BANKNIFTY" />
            ) : (
              <div className="text-center text-slate-400 py-10">Loading Bank Nifty Data...</div>
            )}
          </div>
        )}

        {activeTab === 'indices' && (
          <div className="max-w-full">
            {symbolsData.NIFTY ? (
              <IndexCard indexData={symbolsData.NIFTY} />
            ) : (
              <div className="text-center text-slate-400 py-10">Loading Index Data...</div>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="max-w-full">
            {symbolsData.NIFTY ? (
              <TestIndexCard indexData={symbolsData.NIFTY} />
            ) : (
              <div className="text-center text-slate-400 py-10">Loading Test Data...</div>
            )}
          </div>
        )}

        {/* Dynamic Stock Tabs Content */}
        {openedStockTabs.includes(activeTab) && (() => {
          const stockData = stocks.find(s => s.symbol === activeTab);
          return (
            <div className="max-w-full">
              {stockData ? (
                <SymbolCard indexData={stockData} symbol={activeTab} />
              ) : (
                <div className="text-center text-slate-400 py-10">Loading {activeTab} Data...</div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}