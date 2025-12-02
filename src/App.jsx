import { useState } from 'react';
import { StockCard } from './components/StockCard';

const mockStocks = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.45,
    change: 2.34,
    changePercent: 1.25,
    volume: '52.3M',
    marketCap: '2.95T',
    high: 191.23,
    low: 187.12,
    open: 188.50,
    previousClose: 187.11,
    pe: 29.87,
    eps: 6.34,
    yearHigh: 199.62,
    yearLow: 164.08,
  },
  {
    id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.68,
    change: -1.23,
    changePercent: -0.85,
    volume: '28.7M',
    marketCap: '1.78T',
    high: 144.32,
    low: 142.15,
    open: 143.80,
    previousClose: 143.91,
    pe: 26.45,
    eps: 5.39,
    yearHigh: 153.78,
    yearLow: 121.46,
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 238.72,
    change: 5.67,
    changePercent: 2.43,
    volume: '98.5M',
    marketCap: '758.2B',
    high: 241.50,
    low: 235.80,
    open: 236.40,
    previousClose: 233.05,
    pe: 65.32,
    eps: 3.65,
    yearHigh: 299.29,
    yearLow: 152.37,
  },
  {
    id: 4,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    change: 3.45,
    changePercent: 0.92,
    volume: '21.4M',
    marketCap: '2.82T',
    high: 380.25,
    low: 376.50,
    open: 377.20,
    previousClose: 375.46,
    pe: 35.67,
    eps: 10.62,
    yearHigh: 384.30,
    yearLow: 309.45,
  },
  {
    id: 5,
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 155.23,
    change: -0.89,
    changePercent: -0.57,
    volume: '45.2M',
    marketCap: '1.61T',
    high: 156.78,
    low: 154.90,
    open: 156.12,
    previousClose: 156.12,
    pe: 54.23,
    eps: 2.86,
    yearHigh: 161.72,
    yearLow: 118.35,
  },
  {
    id: 6,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 495.22,
    change: 12.45,
    changePercent: 2.58,
    volume: '156.8M',
    marketCap: '1.22T',
    high: 498.50,
    low: 487.30,
    open: 488.75,
    previousClose: 482.77,
    pe: 72.15,
    eps: 6.87,
    yearHigh: 502.66,
    yearLow: 276.58,
  },
];

export default function App() {
  const [expandedId, setExpandedId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-cyan-400 mb-2">Stock Market Dashboard</h1>
          <p className="text-slate-400">Real-time market overview and analytics</p>
        </div>

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
      </div>
    </div>
  );
}