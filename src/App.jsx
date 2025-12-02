import { useState } from 'react';
import { StockCard } from './components/StockCard';

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

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-cyan-400 mb-2">NSE Commodity Market Dashboard</h1>
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