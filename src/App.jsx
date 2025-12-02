import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const MOCK_STOCKS = [
  { 
    id: 'AAPL', 
    price: 175.50, 
    change: '+1.2%', 
    vol: '55M', 
    details: 'High volume trading day, PE: 28.5. Price showing upward momentum despite market consolidation.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    id: 'GOOGL', 
    price: 135.20, 
    change: '-0.5%', 
    vol: '22M', 
    details: 'Tech sector showing resistance, Beta: 1.1. Trading near its 50-day moving average.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    id: 'TSLA', 
    price: 240.10, 
    change: '+3.5%', 
    vol: '105M', 
    details: 'New vehicle announcement positive, RSI: 72 (Overbought). High trading volume.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  { 
    id: 'AMZN', 
    price: 180.88, 
    change: '+0.1%', 
    vol: '40M', 
    details: 'Holiday sales projection strong, DivYield: 0.0%. Stable performance in e-commerce sector.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
  { 
    id: 'MSFT', 
    price: 405.00, 
    change: '-1.0%', 
    vol: '30M', 
    details: 'Cloud division margin slightly down, MACD: Bearish cross. Watch for support at $400.',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#fa709a'
  },
];

export default function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: 0.45,
      ease: 'power3.out',
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: 0.6, overwrite: true });
  };

  const handleCardMove = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-black p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Commodity Telemetry
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Live Market Data</p>
        </div>

        <div
          ref={rootRef}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          className="relative flex flex-wrap justify-center gap-4"
          style={{ '--r': '280px', '--x': '50%', '--y': '50%' }}
        >
          {MOCK_STOCKS.map((stock) => (
            <article
              key={stock.id}
              onMouseMove={handleCardMove}
              onClick={() => setSelectedStock(stock)}
              className="group relative w-[240px] h-[280px] rounded-3xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
              style={{ background: stock.gradient }}
            >
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.4), transparent 60%)'
                }}
              />
              
              <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{stock.id}</h3>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${stock.change.includes('+') ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                      {stock.change}
                    </span>
                  </div>
                  
                  <div className="text-4xl font-light text-white mb-2">
                    ${stock.price}
                  </div>
                  
                  <div className="text-sm text-white/60">Vol: {stock.vol}</div>
                </div>

                <div className="flex items-center justify-between text-white/40 text-xs">
                  <span>Click for details</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}

          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              backdropFilter: 'grayscale(1) brightness(0.7)',
              WebkitBackdropFilter: 'grayscale(1) brightness(0.7)',
              background: 'rgba(0,0,0,0.001)',
              maskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.68) 88%, white 100%)',
              WebkitMaskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.68) 88%, white 100%)'
            }}
          />
          
          <div
            ref={fadeRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
            style={{
              backdropFilter: 'grayscale(1) brightness(0.7)',
              WebkitBackdropFilter: 'grayscale(1) brightness(0.7)',
              background: 'rgba(0,0,0,0.001)',
              maskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.32) 88%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.32) 88%, transparent 100%)',
              opacity: 1
            }}
          />
        </div>
      </div>

      {selectedStock && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStock(null)}
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: selectedStock.gradient }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            
            <div className="relative z-10 p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-5xl font-bold text-white mb-2">{selectedStock.id}</h2>
                  <div className="text-6xl font-light text-white/95">${selectedStock.price}</div>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-4 border-b border-white/20">
                  <span className="text-white/70 text-sm uppercase tracking-wider">Change</span>
                  <span className={`text-lg font-semibold ${selectedStock.change.includes('+') ? 'text-green-300' : 'text-red-300'}`}>
                    {selectedStock.change}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-white/20">
                  <span className="text-white/70 text-sm uppercase tracking-wider">Volume</span>
                  <span className="text-lg font-semibold text-white">{selectedStock.vol}</span>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Market Analysis</p>
                <p className="text-white/90 leading-relaxed">{selectedStock.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}