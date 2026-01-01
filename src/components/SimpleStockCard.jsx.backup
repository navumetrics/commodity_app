import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, X, Loader2, ChevronRight, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { OptionNumberLineExtra } from './OptionNumberLineExtra';

export function SymbolCard({ indexData, symbol = 'NIFTY' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [extraOptions, setExtraOptions] = useState(null);
  const [extraLTPs, setExtraLTPs] = useState({});
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);
  const [extraError, setExtraError] = useState(null);

  // Zone-based visualization component for single option
  const OptionZoneView = ({ strike, ga, cp, maxa, type, oi, ltp: liveLtp, averagePrice }) => {
    const hasLiveLtp = liveLtp && liveLtp !== cp;
    const ltp = hasLiveLtp ? liveLtp : cp;
    
    // Use live average price if available
    const dailyAverage = averagePrice || null;
    
    // Calculate proximity to GA, MA, and Average (2.5% threshold)
    const PROXIMITY_THRESHOLD = 2.5;
    const percentToGA = (Math.abs(ltp - ga) / ga) * 100;
    const percentToMA = (Math.abs(ltp - maxa) / maxa) * 100;
    const percentToAvg = dailyAverage ? (Math.abs(ltp - dailyAverage) / dailyAverage) * 100 : Infinity;
    
    const isNearGA = percentToGA < PROXIMITY_THRESHOLD;
    const isNearMA = percentToMA < PROXIMITY_THRESHOLD;
    const isNearAvg = dailyAverage ? percentToAvg < PROXIMITY_THRESHOLD : false;
    const inCriticalZone = isNearGA || isNearMA || isNearAvg;
    
    // Determine which zone we're in for color-coding
    const isNearMultiple = (isNearGA && isNearMA) || (isNearGA && isNearAvg) || (isNearMA && isNearAvg);
    const zoneColor = isNearMultiple || isNearGA ? 'yellow' : isNearMA ? 'orange' : 'blue';
    const zoneBgClass = zoneColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                        zoneColor === 'orange' ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/20' :
                        'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20';
    
    // Determine LTP position for visual - include average in range calculation
    const values = [ga, maxa, ltp];
    if (dailyAverage) values.push(dailyAverage);
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const getPosition = (value) => ((value - minValue) / range) * 100;
    
    // Calculate zone intensity (0-1) for visual amplification - 3x scaling
    const gaIntensity = Math.max(0, 1 - (percentToGA / PROXIMITY_THRESHOLD));
    const maIntensity = Math.max(0, 1 - (percentToMA / PROXIMITY_THRESHOLD));
    const avgIntensity = dailyAverage ? Math.max(0, 1 - (percentToAvg / PROXIMITY_THRESHOLD)) : 0;
    const maxIntensity = Math.max(gaIntensity, maIntensity, avgIntensity);
    
    return (
      <div className={`p-3 rounded-lg border transition-all ${
        inCriticalZone ? zoneBgClass : 'bg-slate-800/30 border-slate-700/50'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <span className={`font-semibold ${type.includes('CE') ? 'text-green-400' : 'text-red-400'}`}>
            {type}
          </span>
          <span className="text-xs text-slate-500">OI: {oi.toFixed(0)}</span>
        </div>
        
        {/* LTP with zone alert */}
        <div className="mb-3">
          <div className={`text-2xl font-bold ${
            inCriticalZone ? (zoneColor === 'yellow' ? 'text-yellow-400' : zoneColor === 'orange' ? 'text-orange-400' : 'text-blue-400') : hasLiveLtp ? 'text-cyan-400' : 'text-white'
          }`}>
            ₹{ltp.toFixed(2)}
          </div>
          {inCriticalZone && (
            <div className={`text-xs font-semibold mt-1 ${
              zoneColor === 'yellow' ? 'text-yellow-400' : zoneColor === 'orange' ? 'text-orange-400' : 'text-blue-400'
            }`}>
              ⚠️ {isNearMultiple ? 'NEAR MULTIPLE' : isNearGA ? 'NEAR GA' : isNearMA ? 'NEAR MA' : 'NEAR AVG'}
            </div>
          )}
        </div>
        
        {/* Visual zone indicator */}
        <div className="relative h-16 bg-slate-900/50 rounded-lg mb-3 overflow-visible">
          {/* Zone glow effect */}
          {inCriticalZone && (
            <div 
              className={`absolute inset-0 rounded-lg ${
                zoneColor === 'yellow' ? 'bg-yellow-400/20' : zoneColor === 'orange' ? 'bg-orange-400/20' : 'bg-blue-400/20'
              }`}
              style={{ opacity: maxIntensity * 0.5 }}
            />
          )}
          
          {/* Main line */}
          <div className="absolute top-1/2 left-3 right-3 h-1 bg-slate-600 rounded-full" />
          
          {/* GA Marker - 1.5x larger */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
            style={{ left: `calc(${getPosition(ga)}% * 0.8 + 10%)` }}
            title={`GA: ₹${ga.toFixed(2)}`}
          >
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 cursor-pointer bg-yellow-400 shadow-lg shadow-yellow-400/50"
            style={{ 
              transform: isNearGA ? `scale(${1 + gaIntensity * 2.0})` : 'scale(1)',
              transition: 'transform 0.3s'
            }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              GA: ₹{ga.toFixed(2)}
            </div>
          </div>
          
          {/* Daily Average Marker */}
          {dailyAverage && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
              style={{ left: `calc(${getPosition(dailyAverage)}% * 0.8 + 10%)` }}
              title={`Avg: ₹${dailyAverage.toFixed(2)}`}
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-900 cursor-pointer bg-blue-400 shadow-lg shadow-blue-400/50"
              style={{ 
                transform: isNearAvg ? `scale(${1 + avgIntensity * 2.0})` : 'scale(1)',
                transition: 'transform 0.3s'
              }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Avg: ₹{dailyAverage.toFixed(2)}
              </div>
            </div>
          )}
          
          {/* MA Marker - Vertical Line */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
            style={{ left: `calc(${getPosition(maxa)}% * 0.8 + 10%)` }}
            title={`MA: ₹${maxa.toFixed(2)}`}
          >
            <div className="w-0.5 h-6 cursor-pointer bg-orange-400 shadow-lg shadow-orange-400/50"
            style={{ 
              transform: isNearMA ? `scaleY(${1 + maIntensity * 2.0})` : 'scaleY(1)',
              transition: 'transform 0.3s'
            }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              MA: ₹{maxa.toFixed(2)}
            </div>
          </div>
          
          {/* LTP Marker - Circle with Downward Arrow */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group"
            style={{ left: `calc(${getPosition(ltp)}% * 0.8 + 10%)` }}
            title={`LTP: ₹${ltp.toFixed(2)}`}
          >
            {/* Downward Arrow - Always Yellow */}
            <svg className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5" width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M4 6L0 0H8L4 6Z" fill="#facc15" />
            </svg>
            <div className="w-5 h-5 rounded-full border-2 border-slate-900 cursor-pointer bg-yellow-400 shadow-lg shadow-yellow-400/50" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              LTP: ₹{ltp.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* GA, Average, and MA values - Reordered: MA - Avg - GA */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-orange-400 font-semibold">MA:</span>
            <span className="text-white ml-1">₹{maxa.toFixed(2)}</span>
          </div>
          <div className="text-center">
            <span className="text-blue-400 font-semibold">Avg:</span>
            <span className="text-white ml-1">
              {dailyAverage ? `₹${dailyAverage.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-yellow-400 font-semibold">GA:</span>
            <span className="text-white ml-1">₹{ga.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Side-by-side CE/PE view for each strike
  const StrikePairView = ({ strike, ce, pe, pairType }) => {
    return (
      <div className="mb-4">
        <div className="text-cyan-400 font-semibold mb-3 text-center">
          Strike: {strike} ({pairType})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OptionZoneView
            strike={ce.PRICE}
            ga={ce.GA}
            cp={ce.CP}
            maxa={ce.MAXA}
            oi={ce.OI}
            ltp={ce.ltp}
            averagePrice={ce.average_price}
            type={`CE ${strike}`}
          />
          <OptionZoneView
            strike={pe.PRICE}
            ga={pe.GA}
            cp={pe.CP}
            maxa={pe.MAXA}
            oi={pe.OI}
            ltp={pe.ltp}
            averagePrice={pe.average_price}
            type={`PE ${strike}`}
          />
        </div>
      </div>
    );
  };

  const niftyCp = indexData.cash_data.CP;
  const niftyLtp = indexData.ltp || niftyCp;
  
  // Fetch extra options from MongoDB server (port 3002)
  const fetchExtraOptions = async () => {
    setIsLoadingExtra(true);
    setExtraError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_URL}/api/extra-options?symbol=${symbol}&currentPrice=${niftyLtp}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setExtraOptions(data.data);
        setShowMoreOptions(true);
      } else {
        setExtraError(data.message || 'Failed to fetch extra options');
      }
    } catch (error) {
      console.error('[TestIndexCard] Error fetching extra options:', error);
      setExtraError('MongoDB server not running. Please start it with: npm run mongo-server');
    } finally {
      setIsLoadingExtra(false);
    }
  };

  // Handle WebSocket for extra LTP updates (only if main server is running)
  useEffect(() => {
    if (!showMoreOptions || !extraOptions) return;

    // Get WebSocket from marketDataService
    const ws = window.marketDataWs;
    console.log('[TestIndexCard] WebSocket state:', ws ? ws.readyState : 'no ws');
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[TestIndexCard] Main server offline - showing options without live LTP');
      return;
    }

    // Collect all instrument keys (for Upstox API) from extra options
    const instrumentKeys = [];
    [...extraOptions.above, ...extraOptions.below].forEach(pair => {
      if (pair.ce?.trading_symbol) instrumentKeys.push(pair.ce.instrument_key);
      if (pair.pe?.trading_symbol) instrumentKeys.push(pair.pe.instrument_key);
    });

    console.log('[TestIndexCard] Requesting extra LTP for instrument keys:', instrumentKeys);

    // Request extra LTP updates
    ws.send(JSON.stringify({
      type: 'request_extra_ltp',
      instrumentKeys
    }));

    // Listen for extra LTP updates
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'extra_ltp_update') {
          console.log('[TestIndexCard] Received extra LTP update:', message.data);
          setExtraLTPs(message.data);
        }
      } catch (error) {
        console.error('[TestIndexCard] WebSocket message error:', error);
      }
    };

    ws.addEventListener('message', handleMessage);

    // Cleanup: stop extra LTP updates when panel closes
    return () => {
      ws.removeEventListener('message', handleMessage);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stop_extra_ltp' }));
      }
    };
  }, [showMoreOptions, extraOptions]);

  // Close panel handler
  const closeMoreOptions = () => {
    setShowMoreOptions(false);
    setExtraOptions(null);
    setExtraLTPs({});
    setExtraError(null);
  };
  

  // Option pairs sorted by strike price, but HOI always at the end
  const optionPairs = [
    {
      strike: indexData.ce_summary.MIN.PRICE,
      ce: indexData.ce_summary.MIN,
      pe: indexData.pe_summary.MIN,
      type: 'MIN'
    },
    {
      strike: indexData.ce_summary.BASE.PRICE,
      ce: indexData.ce_summary.BASE,
      pe: indexData.pe_summary.BASE,
      type: 'BASE'
    },
    {
      strike: indexData.ce_summary.MAX.PRICE,
      ce: indexData.ce_summary.MAX,
      pe: indexData.pe_summary.MAX,
      type: 'MAX'
    },
    {
      strike: indexData.ce_summary.HOI.PRICE,
      ce: indexData.ce_summary.HOI,
      pe: indexData.pe_summary.HOI,
      type: 'HOI'
    }
  ].sort((a, b) => {
    // Always keep HOI at the end
    if (a.type === 'HOI') return 1;
    if (b.type === 'HOI') return -1;
    // Sort others by strike price
    return a.strike - b.strike;
  });

  const ltpChange = niftyLtp - niftyCp;
  const isPositive = ltpChange >= 0;

  // Helper functions for critical data display
  const getValueColor = (value, cp, ltp = null) => {
    const reference = ltp || cp;
    const baseColor = value < reference ? 'text-green-400' : value > reference ? 'text-red-400' : 'text-slate-300';
    if (ltp && ltp !== cp) {
      const crossedLtp = (value < cp && value > ltp) || (value > cp && value < ltp);
      if (crossedLtp) {
        return `${baseColor} animate-pulse font-bold border-2 border-cyan-400/50 rounded px-2 py-1`;
      }
    }
    return baseColor;
  };

  const getPLLabel = (value) => {
    if (value > 0) return { label: 'UP', color: 'text-green-400' };
    if (value < 0) return { label: 'DOWN', color: 'text-red-400' };
    return { label: 'FLAT', color: 'text-slate-300' };
  };

  // Helper function for Future data display (uses FCP and future_ltp)
  const getFutureValueColor = (value, fcp, futureLtp) => {
    // Use FCP if no live future LTP available
    const reference = futureLtp || fcp;
    const baseColor = value < reference ? 'text-green-400' : value > reference ? 'text-red-400' : 'text-slate-300';
    
    // Check if value crossed between FCP and future_ltp (only if we have live data)
    if (futureLtp && fcp && futureLtp !== fcp) {
      const minPrice = Math.min(fcp, futureLtp);
      const maxPrice = Math.max(fcp, futureLtp);
      const isBetween = value > minPrice && value < maxPrice;
      
      if (isBetween) {
        return `${baseColor} animate-pulse font-bold border-2 border-cyan-400/50 rounded px-2 py-1`;
      }
    }
    return baseColor;
  };

  // Helper function for BSP indicators (special color logic)
  const getBSPValueColor = (bspValue, niftyCp, niftyLtp, fcp, futureLtp) => {
    // Color logic: green if nifty_ltp > BSP (priority), yellow if only future_ltp > BSP, otherwise red
    let baseColor = 'text-red-400';
    if (niftyLtp > bspValue) {
      baseColor = 'text-green-400';
    } else if (futureLtp && futureLtp > bspValue) {
      baseColor = 'text-yellow-400';
    }
    
    // Border logic: show border if BSP crossed between CP/FCP and LTP today
    const crossedNifty = (bspValue > niftyCp && bspValue < niftyLtp) || (bspValue < niftyCp && bspValue > niftyLtp);
    const crossedFuture = futureLtp && fcp && ((bspValue > fcp && bspValue < futureLtp) || (bspValue < fcp && bspValue > futureLtp));
    
    if (crossedNifty || crossedFuture) {
      return `${baseColor} animate-pulse font-bold border-2 border-cyan-400/50 rounded px-2 py-1`;
    }
    
    return baseColor;
  };

  const fplStatus = getPLLabel(indexData.future_data.FPL);
  const currCeplStatus = getPLLabel(indexData.future_data.CURR_CEPL);
  const nextCeplStatus = getPLLabel(indexData.future_data.NEXT_CEPL);
  const currPeplStatus = getPLLabel(indexData.future_data.CURR_PEPL);
  const nextPeplStatus = getPLLabel(indexData.future_data.NEXT_PEPL);

  return (
    <motion.div
      layout
      className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/50 transition-colors duration-300"
      whileHover={{ scale: isExpanded ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />

      {/* Compact Header View - Click to expand/collapse */}
      <div 
        className="relative z-10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">{indexData.symbol} (TEST)</h3>
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
            <div className="text-slate-400 text-xs">{symbol} Future</div>
            <div className="text-cyan-400 text-lg font-semibold">
              ₹{((indexData.future_ltp && indexData.future_ltp !== indexData.ltp) ? indexData.future_ltp : (indexData.future_data?.FCP || 0)).toFixed(2)}
            </div>
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Critical Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Base Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <BarChart3 className="w-5 h-5" />
                  <h4 className="font-semibold">Base Data</h4>
                </div>
                <div className="space-y-3">
                  {/* MIN */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">MIN</span>
                    <span className={`font-semibold ${getValueColor(indexData.base_data.MIN, niftyCp, niftyLtp)}`}>
                      {(indexData.base_data.MIN || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* BASE */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">BASE</span>
                    <span className={`font-semibold ${getValueColor(indexData.base_data.BASE, niftyCp, niftyLtp)}`}>
                      {(indexData.base_data.BASE || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* MAX */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">MAX</span>
                    <span className={`font-semibold ${getValueColor(indexData.base_data.MAX, niftyCp, niftyLtp)}`}>
                      {(indexData.base_data.MAX || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* CP */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CP</span>
                    <span className="text-white font-semibold">{(indexData.cash_data.CP || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-semibold">Cash Data</h4>
                </div>
                <div className="space-y-3">
                  {/* HLC */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">HLC</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.HLC || 0, niftyCp, niftyLtp)}`}>
                      {(indexData.cash_data.HLC || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* A0 */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">A0</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.A0 || 0, niftyCp, niftyLtp)}`}>
                      {(indexData.cash_data.A0 || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* KJ */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">KJ</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.KJ || 0, niftyCp, niftyLtp)}`}>
                      {(indexData.cash_data.KJ || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* CASH_AVG */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">CASH_AVG</span>
                    <span className={`font-semibold ${getValueColor(indexData.future_data.CASH_AVG, niftyCp, niftyLtp)}`}>
                      {(indexData.future_data.CASH_AVG || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* DA */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">DA</span>
                    <span className={`font-semibold ${getValueColor(indexData.cash_data.DA, niftyCp, niftyLtp)}`}>
                      {(indexData.cash_data.DA || 0).toFixed(2)}
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
                  {/* LWAVG */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">LWAVG</span>
                    <span className={`font-semibold ${getFutureValueColor(indexData.base_data.LWAVG, indexData.future_data.FCP, indexData.future_ltp)}`}>
                      {(indexData.base_data.LWAVG || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* HOIAVG */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">HOIAVG</span>
                    <span className={`font-semibold ${getFutureValueColor(indexData.base_data.HOIAVG, indexData.future_data.FCP, indexData.future_ltp)}`}>
                      {(indexData.base_data.HOIAVG || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* AVG */}
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">AVG</span>
                    <span className={`font-semibold ${getFutureValueColor(indexData.future_data.AVG, indexData.future_data.FCP, indexData.future_ltp)}`}>
                      {(indexData.future_data.AVG || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Y0DA Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h4 className="font-semibold">Y0DA Data</h4>
                </div>
                <div className="space-y-3">
                  {indexData.Y0DA_data && Object.entries(indexData.Y0DA_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">{key}</span>
                      <span className={`font-semibold ${getValueColor(parseFloat(value), niftyCp, niftyLtp)}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BSP Indicators Row */}
            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <TrendingUp className="w-5 h-5" />
                <h4 className="font-semibold">BSP Indicators</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* BSP_OPTIONS */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">BSP OPTIONS</span>
                  <span className={`font-semibold text-lg ${getBSPValueColor(indexData.base_data.BSP_OPTIONS || 0, niftyCp, niftyLtp, indexData.future_data.FCP, indexData.future_ltp)}`}>
                    {(indexData.base_data.BSP_OPTIONS || 0).toFixed(2)}
                  </span>
                </div>
                {/* BSP_MAX_OI */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">BSP MAX OI</span>
                  <span className={`font-semibold text-lg ${getBSPValueColor(indexData.base_data.BSP_MAX_OI || 0, niftyCp, niftyLtp, indexData.future_data.FCP, indexData.future_ltp)}`}>
                    {(indexData.base_data.BSP_MAX_OI || 0).toFixed(2)}
                  </span>
                </div>
                {/* BSP_FUTURES */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">BSP FUTURES</span>
                  <span className={`font-semibold text-lg ${getBSPValueColor(indexData.base_data.BSP_FUTURES || 0, niftyCp, niftyLtp, indexData.future_data.FCP, indexData.future_ltp)}`}>
                    {(indexData.base_data.BSP_FUTURES || 0).toFixed(2)}
                  </span>
                </div>
                {/* BSP_TP */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">BSP TP</span>
                  <span className={`font-semibold text-lg ${getBSPValueColor(indexData.base_data.BSP_TP || 0, niftyCp, niftyLtp, indexData.future_data.FCP, indexData.future_ltp)}`}>
                    {(indexData.base_data.BSP_TP || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* CEPL/PEPL Row - Below the 4-column grid */}
            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <Activity className="w-5 h-5" />
                <h4 className="font-semibold">Profit/Loss Indicators</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* CURR CEPL */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">CURR CEPL</span>
                  <span className={`font-semibold text-lg ${currCeplStatus.color}`}>{currCeplStatus.label}</span>
                </div>
                {/* NEXT CEPL */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">NEXT CEPL</span>
                  <span className={`font-semibold text-lg ${nextCeplStatus.color}`}>{nextCeplStatus.label}</span>
                </div>
                {/* CURR PEPL */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">CURR PEPL</span>
                  <span className={`font-semibold text-lg ${currPeplStatus.color}`}>{currPeplStatus.label}</span>
                </div>
                {/* NEXT PEPL */}
                <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400 text-xs mb-2">NEXT PEPL</span>
                  <span className={`font-semibold text-lg ${nextPeplStatus.color}`}>{nextPeplStatus.label}</span>
                </div>
              </div>
            </div>

            {/* More Options Overlay - Appears below P/L row */}
            <AnimatePresence>
              {showMoreOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-2xl">
                    {/* Panel Header */}
                    <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-between">
                      <h2 className="text-cyan-400 text-xl font-bold">More Options</h2>
                      <button
                        onClick={closeMoreOptions}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6 text-slate-400" />
                      </button>
                    </div>

                    {/* Panel Content */}
                    <div className="p-4">
                      {extraError ? (
                        // Error State
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                          <p className="font-semibold">Error</p>
                          <p className="text-sm mt-1">{extraError}</p>
                        </div>
                      ) : extraOptions ? (
                        <div className="space-y-3">
                          {/* Options Above Current Price */}
                          {extraOptions.above && extraOptions.above.length > 0 && (
                            <div className="space-y-2">
                              {[...extraOptions.above].reverse().map((pair, index) => (
                                <div key={`above-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <OptionNumberLineExtra
                                    strike={pair.strike}
                                    ga={pair.ce.GA}
                                    va={pair.ce.VA}
                                    cp={pair.ce.CP}
                                    maxa={pair.ce.MAXA}
                                    oi={pair.ce.OI}
                                    ltp={extraLTPs[pair.ce.instrument_key]?.ltp}
                                    averagePrice={extraLTPs[pair.ce.instrument_key]?.average_price}
                                    type={`CE ${pair.strike}`}
                                  />
                                  <OptionNumberLineExtra
                                    strike={pair.strike}
                                    ga={pair.pe.GA}
                                    va={pair.pe.VA}
                                    cp={pair.pe.CP}
                                    maxa={pair.pe.MAXA}
                                    oi={pair.pe.OI}
                                    ltp={extraLTPs[pair.pe.instrument_key]?.ltp}
                                    averagePrice={extraLTPs[pair.pe.instrument_key]?.average_price}
                                    type={`PE ${pair.strike}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Current Nifty Price Divider */}
                          <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-cyan-500/50"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-slate-800 px-2 py-1 text-cyan-400 font-semibold text-xs rounded border border-cyan-500/50">
                                NIFTY: ₹{extraOptions.currentPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Options Below Current Price */}
                          {extraOptions.below && extraOptions.below.length > 0 && (
                            <div className="space-y-2">
                              {extraOptions.below.map((pair, index) => (
                                <div key={`below-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <OptionNumberLineExtra
                                    strike={pair.strike}
                                    ga={pair.ce.GA}
                                    va={pair.ce.VA}
                                    cp={pair.ce.CP}
                                    maxa={pair.ce.MAXA}
                                    oi={pair.ce.OI}
                                    ltp={extraLTPs[pair.ce.instrument_key]?.ltp}
                                    averagePrice={extraLTPs[pair.ce.instrument_key]?.average_price}
                                    type={`CE ${pair.strike}`}
                                  />
                                  <OptionNumberLineExtra
                                    strike={pair.strike}
                                    ga={pair.pe.GA}
                                    va={pair.pe.VA}
                                    cp={pair.pe.CP}
                                    maxa={pair.pe.MAXA}
                                    oi={pair.pe.OI}
                                    ltp={extraLTPs[pair.pe.instrument_key]?.ltp}
                                    averagePrice={extraLTPs[pair.pe.instrument_key]?.average_price}
                                    type={`PE ${pair.strike}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* No Options Message */}
                          {(!extraOptions.above || extraOptions.above.length === 0) && 
                           (!extraOptions.below || extraOptions.below.length === 0) && (
                            <div className="text-center text-slate-400 py-8">
                              No extra options available
                            </div>
                          )}
                        </div>
                      ) : (
                        // Loading State
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options Side-by-Side View - Only show when overlay is closed */}
            {!showMoreOptions && (
              <div className="space-y-6">
              {optionPairs.map((pair, index) => (
                <StrikePairView
                  key={index}
                  strike={pair.strike}
                  ce={pair.ce}
                  pe={pair.pe}
                  pairType={pair.type}
                />
              ))}
              
              {/* More Options Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={fetchExtraOptions}
                  disabled={isLoadingExtra}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingExtra ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      More Options
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              </div>
            )}

            <div className="mt-6 text-center text-slate-500 text-sm">
              Click header to collapse
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
