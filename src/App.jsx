import { useState, useEffect } from 'react';
import { StockCard } from './components/StockCard';
import { IndexCard } from './components/IndexCard';
import { TestIndexCard } from './components/TestIndexCard';
import { SymbolCard } from './components/SymbolCard';
import { Wifi, WifiOff } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('nifty'); // 'stocks', 'indices', 'test', 'nifty', 'banknifty'
  const [isConnected, setIsConnected] = useState(false);
  const [symbolsData, setSymbolsData] = useState({}); // { NIFTY: {...}, BANKNIFTY: {...} }

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
        </div>

        {/* Tab Content */}
        {activeTab === 'stocks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                isExpanded={expandedId === stock.id}
                onClick={() => handleCardClick(stock.id)}
              />
            ))}
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
      </div>
    </div>
  );
}