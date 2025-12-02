import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Calendar } from 'lucide-react';

export function StockCard({ stock, isExpanded, onClick }) {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        relative cursor-pointer overflow-hidden
        bg-gradient-to-br from-slate-800/50 to-slate-900/50
        backdrop-blur-sm border border-slate-700/50
        rounded-xl p-5
        hover:border-cyan-500/50 transition-colors duration-300
        ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
      `}
      whileHover={{ scale: isExpanded ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />

      {/* Compact View */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
            `}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white">{stock.symbol}</h3>
              <p className="text-slate-400 text-sm">{stock.name}</p>
            </div>
          </div>
          
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-md
            ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
          `}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm">{isPositive ? '+' : ''}{stock.changePercent}%</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-white text-2xl">${stock.price.toFixed(2)}</div>
            <div className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)} today
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-slate-400 text-xs">Volume</div>
            <div className="text-cyan-400 text-sm">{stock.volume}</div>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 mt-6 pt-6 border-t border-slate-700/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Market Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <BarChart3 className="w-5 h-5" />
                  <h4>Market Stats</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Market Cap</span>
                    <span className="text-white">{stock.marketCap}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">P/E Ratio</span>
                    <span className="text-white">{stock.pe}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">EPS</span>
                    <span className="text-white">${stock.eps}</span>
                  </div>
                </div>
              </div>

              {/* Today's Trading */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h4>Today's Trading</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Open</span>
                    <span className="text-white">${stock.open.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">High</span>
                    <span className="text-emerald-400">${stock.high.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Low</span>
                    <span className="text-red-400">${stock.low.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Historical */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <h4>Historical</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Prev Close</span>
                    <span className="text-white">${stock.previousClose.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">52W High</span>
                    <span className="text-emerald-400">${stock.yearHigh.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">52W Low</span>
                    <span className="text-red-400">${stock.yearLow.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Activity className="w-5 h-5" />
                  <h4>Performance</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-sm mb-2">Today's Change</div>
                    <div className={`text-2xl ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                    <div className={`text-sm mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.changePercent}%
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-sm mb-2">Volume</div>
                    <div className="text-cyan-400 text-xl">{stock.volume}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Click to collapse hint */}
            <div className="mt-6 text-center text-slate-500 text-sm">
              Click to collapse
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
