import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Calendar, DollarSign } from 'lucide-react';

export function IndexCard({ indexData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate LTP for now (will be replaced with live data later)
  const simulateLTP = (cp, ga, maxa) => {
    const min = Math.min(cp, ga, maxa);
    const max = Math.max(cp, ga, maxa);
    const range = max - min;
    return min + (Math.random() * range * 1.2) - (range * 0.1);
  };

  // Color coding based on comparison with reference value
  // When LTP is available, use it as the reference instead of CP
  const getValueColor = (value, cp, ltp = null) => {
    const reference = ltp || cp; // Use LTP if available, otherwise CP
    const baseColor = value < reference ? 'text-green-400' : value > reference ? 'text-red-400' : 'text-slate-300';
    
    // If LTP is available and different from CP, check if this value crossed LTP
    if (ltp && ltp !== cp) {
      const crossedLtp = (value < cp && value > ltp) || (value > cp && value < ltp);
      if (crossedLtp) {
        return `${baseColor} animate-pulse font-bold border-2 border-cyan-400/50 rounded px-2 py-1`;
      }
    }
    
    return baseColor;
  };

  // Get UP/DOWN label for P&L values
  const getPLLabel = (value) => {
    if (value > 0) return { label: 'UP', color: 'text-green-400' };
    if (value < 0) return { label: 'DOWN', color: 'text-red-400' };
    return { label: 'FLAT', color: 'text-slate-300' };
  };

  // Number line component for options
  const OptionNumberLine = ({ strike, ga, cp, maxa, type, oi, ltp: liveLtp }) => {
    // Use live LTP if available AND different from CP
    const hasLiveLtp = liveLtp && liveLtp !== cp;
    const ltp = hasLiveLtp ? liveLtp : null;
    
    // Sort GA and MA in ascending order for display
    const leftValue = Math.min(ga, maxa);
    const rightValue = Math.max(ga, maxa);
    const isGaLeft = ga < maxa;
    
    // Only use sorted values and LTP for the number line
    const values = ltp ? [leftValue, rightValue, ltp] : [leftValue, rightValue];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const getPosition = (value) => ((value - min) / range) * 100;

    // Determine LTP position relative to actual GA and MA (not left/right)
    let ltpStatus = '';
    if (ltp) {
      const rangeSize = Math.abs(maxa - ga);
      const proximityThreshold = rangeSize * 0.15; // 15% of range
      
      // Compare with actual MA (higher resistance)
      if (ltp > maxa) {
        const distance = ltp - maxa;
        ltpStatus = distance > proximityThreshold ? 'above-ma-far' : 'above-ma-close';
      } 
      // Compare with actual GA (lower support)
      else if (ltp < ga) {
        const distance = ga - ltp;
        ltpStatus = distance > proximityThreshold ? 'below-ga-far' : 'below-ga-close';
      } 
      // Between GA and MA
      else {
        const distanceFromGa = Math.abs(ltp - ga);
        const distanceFromMa = Math.abs(ltp - maxa);
        
        if (distanceFromGa < proximityThreshold) {
          ltpStatus = 'near-ga';
        } else if (distanceFromMa < proximityThreshold) {
          ltpStatus = 'near-ma';
        } else {
          ltpStatus = 'mid-range';
        }
      }
    }

    return (
      <div className="mb-4">
        {/* Header with strike and OI */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-cyan-400 font-semibold">{strike}</span>
          <span className="text-xs text-slate-500">{type} | OI: {oi.toFixed(0)}</span>
        </div>
        
        {/* LTP Display - Above the line */}
        {ltp && (
          <div className="mb-2 text-center">
            <div className="text-xs text-slate-400 mb-1">Live Price</div>
            <div className="text-2xl font-bold text-cyan-400 animate-pulse">
              ₹{ltp.toFixed(2)}
            </div>
            <div className="text-xs mt-1">
              {ltpStatus === 'above-ma-far' && <span className="text-green-400">▲ Above MA</span>}
              {ltpStatus === 'above-ma-close' && <span className="text-green-400">↗ Approaching MA</span>}
              {ltpStatus === 'near-ma' && <span className="text-yellow-400">● Close to MA</span>}
              {ltpStatus === 'mid-range' && <span className="text-blue-400">● Mid Range</span>}
              {ltpStatus === 'near-ga' && <span className="text-yellow-400">● Close to GA</span>}
              {ltpStatus === 'below-ga-close' && <span className="text-red-400">↘ Approaching GA</span>}
              {ltpStatus === 'below-ga-far' && <span className="text-red-400">▼ Below GA</span>}
            </div>
          </div>
        )}
        
        {/* Number Line */}
        <div className="relative h-12 bg-slate-800/50 rounded-lg mb-3">
          {/* Main line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-yellow-500/30 via-slate-600 to-purple-500/30 rounded-full"></div>
          
          {/* Left Marker (Lower value) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `calc(${getPosition(leftValue)}% * 0.85 + 7.5%)` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-lg"></div>
              <div className="h-4 w-0.5 bg-yellow-400/50"></div>
            </div>
          </div>
          
          {/* Right Marker (Higher value) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `calc(${getPosition(rightValue)}% * 0.85 + 7.5%)` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full border-2 border-slate-900 shadow-lg"></div>
              <div className="h-4 w-0.5 bg-purple-400/50"></div>
            </div>
          </div>
          
          {/* LTP Marker (Cyan - Dynamic position) */}
          {ltp && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              style={{ left: `calc(${getPosition(ltp)}% * 0.85 + 7.5%)` }}
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-900 shadow-xl animate-pulse"></div>
                <div className="absolute top-4 w-0.5 h-6 bg-cyan-400"></div>
              </div>
            </div>
          )}
        </div>

        {/* Values below the line - Always in ascending order */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <div className="text-yellow-400 font-semibold mb-1">{isGaLeft ? 'GA' : 'MA'}</div>
            <div className="text-white text-lg">₹{leftValue.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-purple-400 font-semibold mb-1">{isGaLeft ? 'MA' : 'GA'}</div>
            <div className="text-white text-lg">₹{rightValue.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  };

  const niftyCp = indexData.cash_data.CP;
  const niftyLtp = indexData.ltp || niftyCp; // Use live LTP if available, fallback to CP
  
  // Debug logging
  console.log('[IndexCard] Data:', {
    cp: niftyCp,
    ltp: indexData.ltp,
    displayLtp: niftyLtp,
    hasLiveLtp: indexData.ltp && indexData.ltp !== niftyCp
  });
  
  const fplStatus = getPLLabel(indexData.future_data.FPL);
  const currCeplStatus = getPLLabel(indexData.future_data.CURR_CEPL);
  const nextCeplStatus = getPLLabel(indexData.future_data.NEXT_CEPL);
  const currPeplStatus = getPLLabel(indexData.future_data.CURR_PEPL);
  const nextPeplStatus = getPLLabel(indexData.future_data.NEXT_PEPL);

  const optionPairs = [
    {
      strike: indexData.ce_summary.MIN.PRICE,
      ce: indexData.ce_summary.MIN,
      pe: indexData.pe_summary.MAX,
      type: 'MIN/MAX'
    },
    {
      strike: indexData.ce_summary.BASE.PRICE,
      ce: indexData.ce_summary.BASE,
      pe: indexData.pe_summary.BASE,
      type: 'BASE'
    },
    {
      strike: indexData.ce_summary.HOI.PRICE,
      ce: indexData.ce_summary.HOI,
      pe: indexData.pe_summary.HOI,
      type: 'HOI'
    },
    {
      strike: indexData.ce_summary.MAX.PRICE,
      ce: indexData.ce_summary.MAX,
      pe: indexData.pe_summary.MIN,
      type: 'MAX/MIN'
    }
  ].sort((a, b) => a.strike - b.strike);

  const cashChange = indexData.cash_data.DA - niftyCp;
  const ltpChange = niftyLtp - niftyCp; // Change from yesterday's close
  const isPositive = ltpChange >= 0;

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="relative cursor-pointer overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/50 transition-colors duration-300"
      whileHover={{ scale: isExpanded ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />

      {/* Compact Header View */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">{indexData.symbol}</h3>
              <p className="text-slate-400 text-sm">Expiry: {indexData.expiry_date}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm">{isPositive ? '+' : ''}{((ltpChange / niftyCp) * 100).toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-white text-2xl font-bold">{niftyLtp.toFixed(2)}</div>
            <div className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{ltpChange.toFixed(2)} today
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-slate-400 text-xs">Trade Date</div>
            <div className="text-cyan-400 text-sm">{indexData.trade_date}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Y0DA Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h4 className="font-semibold">Historical (Y0DA)</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(indexData.Y0DA_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">{key}</span>
                      <span className={`font-semibold ${getValueColor(parseFloat(value), niftyCp, niftyLtp)}`}>
                        {parseFloat(value).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <BarChart3 className="w-5 h-5" />
                  <h4 className="font-semibold">Base Data</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(indexData.base_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">{key}</span>
                      <span className={`font-semibold ${getValueColor(value, niftyCp, niftyLtp)}`}>
                        {value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-semibold">Cash Data</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CP</span>
                    <span className="text-white font-semibold">{indexData.cash_data.CP.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">DA</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.DA, niftyCp, niftyLtp)}`}>
                      {indexData.cash_data.DA.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">MEDIAN</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.MEDIAN, niftyCp, niftyLtp)}`}>
                      {indexData.cash_data.MEDIAN.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">UP / DOWN</span>
                    <span className="font-semibold">
                      <span className="text-green-400">{indexData.cash_data.UP}</span>
                      {' / '}
                      <span className="text-red-400">{indexData.cash_data.DOWN}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Future Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Activity className="w-5 h-5" />
                  <h4 className="font-semibold">Future Data</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">FPL</span>
                    <span className={`font-semibold ${fplStatus.color}`}>{fplStatus.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">HLB</span>
                    <span className={`font-semibold ${getValueColor(indexData.future_data.HLB, niftyCp, niftyLtp)}`}>
                      {indexData.future_data.HLB.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CE / PE CNT</span>
                    <span className="text-white font-semibold">
                      {indexData.future_data.CE_CNT} / {indexData.future_data.PE_CNT}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CURR CEPL</span>
                    <span className={`font-semibold ${currCeplStatus.color}`}>{currCeplStatus.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">NEXT CEPL</span>
                    <span className={`font-semibold ${nextCeplStatus.color}`}>{nextCeplStatus.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CURR PEPL</span>
                    <span className={`font-semibold ${currPeplStatus.color}`}>{currPeplStatus.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">NEXT PEPL</span>
                    <span className={`font-semibold ${nextPeplStatus.color}`}>{nextPeplStatus.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Future Data */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-3">Additional Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">AVG</span>
                  <span className={`font-semibold ${getValueColor(indexData.future_data.AVG, niftyCp, niftyLtp)}`}>
                    {indexData.future_data.AVG.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">RF</span>
                  <span className="text-white font-semibold">{indexData.future_data.RF.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">TRF</span>
                  <span className="text-white font-semibold">{indexData.future_data.TRF.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">CASH_AVG</span>
                  <span className={`font-semibold ${getValueColor(indexData.future_data.CASH_AVG, niftyCp, niftyLtp)}`}>
                    {indexData.future_data.CASH_AVG.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-6">
              <h3 className="text-cyan-400 font-semibold text-lg">Options Analysis</h3>
              {optionPairs.map((pair, index) => (
                <div key={index} className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-semibold mb-4">Strike: {pair.strike} ({pair.type})</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-green-400 font-semibold mb-3 text-sm">Call (CE)</h5>
                      <OptionNumberLine 
                        strike={pair.ce.PRICE}
                        ga={pair.ce.GA}
                        cp={pair.ce.CP}
                        maxa={pair.ce.MAXA}
                        oi={pair.ce.OI}
                        ltp={pair.ce.ltp}
                        type="CE"
                      />
                      {console.log('[IndexCard] CE Option:', {
                        strike: pair.ce.PRICE,
                        cp: pair.ce.CP,
                        ltp: pair.ce.ltp,
                        hasLtp: pair.ce.ltp && pair.ce.ltp !== pair.ce.CP
                      })}
                    </div>
                    
                    <div>
                      <h5 className="text-red-400 font-semibold mb-3 text-sm">Put (PE)</h5>
                      <OptionNumberLine 
                        strike={pair.pe.PRICE}
                        ga={pair.pe.GA}
                        cp={pair.pe.CP}
                        maxa={pair.pe.MAXA}
                        oi={pair.pe.OI}
                        ltp={pair.pe.ltp}
                        type="PE"
                      />
                      {console.log('[IndexCard] PE Option:', {
                        strike: pair.pe.PRICE,
                        cp: pair.pe.CP,
                        ltp: pair.pe.ltp,
                        hasLtp: pair.pe.ltp && pair.pe.ltp !== pair.pe.CP
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-slate-500 text-sm">
              Click to collapse
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
