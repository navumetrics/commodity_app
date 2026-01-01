import { useState } from 'react';

export function OptionNumberLineExtra({ strike, ga, va, cp, maxa, type, oi, ltp: liveLtp, averagePrice: liveAvgPrice }) {
  const hasLiveLtp = liveLtp && liveLtp !== cp;
  const ltp = hasLiveLtp ? liveLtp : cp;
  
  // Only use live average price from Upstox, no fallback calculation
  const hasLiveAvgPrice = liveAvgPrice && typeof liveAvgPrice === 'number';
  const dailyAverage = hasLiveAvgPrice ? liveAvgPrice : null;
  
  // Calculate proximity to GA, VA, MA, and Average (2.5% threshold)
  const PROXIMITY_THRESHOLD = 2.5;
  const percentToGA = (Math.abs(ltp - ga) / ga) * 100;
  const percentToVA = (Math.abs(ltp - va) / va) * 100;
  const percentToMA = (Math.abs(ltp - maxa) / maxa) * 100;
  const percentToAvg = dailyAverage ? (Math.abs(ltp - dailyAverage) / dailyAverage) * 100 : Infinity;
  
  const isNearGA = percentToGA < PROXIMITY_THRESHOLD;
  const isNearVA = percentToVA < PROXIMITY_THRESHOLD;
  const isNearMA = percentToMA < PROXIMITY_THRESHOLD;
  const isNearAvg = dailyAverage ? percentToAvg < PROXIMITY_THRESHOLD : false;
  const inCriticalZone = isNearGA || isNearVA || isNearMA || isNearAvg;
  
  // Determine which zone we're in for color-coding
  const isNearMultiple = (isNearGA && isNearMA) || (isNearGA && isNearAvg) || (isNearMA && isNearAvg) || (isNearGA && isNearVA) || (isNearVA && isNearMA) || (isNearVA && isNearAvg);
  const zoneColor = isNearMultiple || isNearGA ? 'yellow' : isNearMA ? 'orange' : isNearVA ? 'pink' : 'blue';
  const zoneBgClass = zoneColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                      zoneColor === 'orange' ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/20' :
                      zoneColor === 'pink' ? 'bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/20' :
                      'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20';
  
  // Determine LTP position for visual - include all markers in range calculation
  const values = [ga, va, maxa, ltp];
  if (dailyAverage) values.push(dailyAverage);
  
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const getPosition = (value) => ((value - minValue) / range) * 100;
  
  // Calculate zone intensity (0-1) for visual amplification - 3x scaling
  const gaIntensity = Math.max(0, 1 - (percentToGA / PROXIMITY_THRESHOLD));
  const vaIntensity = Math.max(0, 1 - (percentToVA / PROXIMITY_THRESHOLD));
  const maIntensity = Math.max(0, 1 - (percentToMA / PROXIMITY_THRESHOLD));
  const avgIntensity = dailyAverage ? Math.max(0, 1 - (percentToAvg / PROXIMITY_THRESHOLD)) : 0;
  const maxIntensity = Math.max(gaIntensity, vaIntensity, maIntensity, avgIntensity);
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      inCriticalZone ? zoneBgClass : 'bg-slate-800/30 border-slate-700/50'
    }`}>
      {/* Header with Type and LTP */}
      <div className="flex justify-between items-center mb-1">
        <span className={`font-semibold text-sm ${type.includes('CE') ? 'text-green-400' : 'text-red-400'}`}>
          {type}
        </span>
        {hasLiveLtp ? (
          <div className={`text-base font-bold ${
            inCriticalZone ? (zoneColor === 'yellow' ? 'text-yellow-400' : zoneColor === 'orange' ? 'text-orange-400' : zoneColor === 'pink' ? 'text-pink-400' : 'text-blue-400') : 'text-cyan-400'
          }`}>
            ₹{ltp.toFixed(2)}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            No Live Data
          </div>
        )}
      </div>
      
      {/* Zone alert */}
      {hasLiveLtp && inCriticalZone && (
        <div className={`text-[11px] font-semibold mb-1 ${
          zoneColor === 'yellow' ? 'text-yellow-400' : zoneColor === 'orange' ? 'text-orange-400' : zoneColor === 'pink' ? 'text-pink-400' : 'text-blue-400'
        }`}>
          ⚠️ {isNearMultiple ? 'NEAR MULTIPLE' : isNearGA ? 'NEAR GA' : isNearVA ? 'NEAR VA' : isNearMA ? 'NEAR MA' : 'NEAR AVG'}
        </div>
      )}
      
      {/* Visual zone indicator */}
      <div className="relative h-14 bg-slate-900/50 rounded-lg mb-2 overflow-visible">
        {/* Zone glow effect */}
        {inCriticalZone && (
          <div 
            className={`absolute inset-0 rounded-lg ${
              zoneColor === 'yellow' ? 'bg-yellow-400/20' : zoneColor === 'orange' ? 'bg-orange-400/20' : zoneColor === 'pink' ? 'bg-pink-400/20' : 'bg-blue-400/20'
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
          <div className="w-5 h-5 rounded-full border border-slate-900 cursor-pointer bg-yellow-400 shadow-lg shadow-yellow-400/50"
          style={{ 
            transform: isNearGA ? `scale(${1 + gaIntensity * 2.0})` : 'scale(1)',
            transition: 'transform 0.3s'
          }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            GA: ₹{ga.toFixed(2)}
          </div>
        </div>
        
        {/* VA Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
          style={{ left: `calc(${getPosition(va)}% * 0.8 + 10%)` }}
          title={`VA: ₹${va.toFixed(2)}`}
        >
          <div className="w-3.5 h-3.5 rounded-full border border-slate-900 cursor-pointer bg-pink-300 shadow-lg shadow-pink-300/50"
          style={{ 
            transform: isNearVA ? `scale(${1 + vaIntensity * 2.0})` : 'scale(1)',
            transition: 'transform 0.3s'
          }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            VA: ₹{va.toFixed(2)}
          </div>
        </div>
        
        {/* Daily Average Marker - Only show if we have live average price */}
        {dailyAverage && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
            style={{ left: `calc(${getPosition(dailyAverage)}% * 0.8 + 10%)` }}
            title={`Avg: ₹${dailyAverage.toFixed(2)}`}
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-900 cursor-pointer bg-blue-400 shadow-lg shadow-blue-400/50"
            style={{ 
              transform: isNearAvg ? `scale(${1 + avgIntensity * 2.0})` : 'scale(1)',
              transition: 'transform 0.3s'
            }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
          <div className="w-0.5 h-5 cursor-pointer bg-orange-400 shadow-lg shadow-orange-400/50"
          style={{ 
            transform: isNearMA ? `scaleY(${1 + maIntensity * 2.0})` : 'scaleY(1)',
            transition: 'transform 0.3s'
          }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            MA: ₹{maxa.toFixed(2)}
          </div>
        </div>
        
        {/* LTP Marker - Circle with Downward Arrow - Only show when we have live LTP */}
        {hasLiveLtp && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group"
            style={{ left: `calc(${getPosition(ltp)}% * 0.8 + 10%)` }}
            title={`LTP: ₹${ltp.toFixed(2)}`}
          >
            {/* Downward Arrow - Always Yellow */}
            <svg className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5" width="6" height="5" viewBox="0 0 6 5" fill="none">
              <path d="M3 5L0 0H6L3 5Z" fill="#facc15" />
            </svg>
            <div className="w-4 h-4 rounded-full border-2 border-slate-900 cursor-pointer bg-yellow-400 shadow-lg shadow-yellow-400/50"
            style={{ 
              transform: 'scale(1.2)',
              transition: 'transform 0.3s'
            }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-7 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              LTP: ₹{ltp.toFixed(2)}
            </div>
          </div>
        )}
      </div>
      
      {/* GA, VA, Average, and MA values - 2 rows */}
      <div className="space-y-2">
        {/* Row 1: GA and MA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-slate-900/30 rounded px-2 py-1.5">
            <span className="text-yellow-400 font-semibold text-xs">GA:</span>
            <span className="text-white font-medium text-xs">₹{ga.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/30 rounded px-2 py-1.5">
            <span className="text-orange-400 font-semibold text-xs">MA:</span>
            <span className="text-white font-medium text-xs">₹{maxa.toFixed(0)}</span>
          </div>
        </div>
        
        {/* Row 2: VA and Avg */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-slate-900/30 rounded px-2 py-1.5">
            <span className="text-pink-300 font-semibold text-xs">VA:</span>
            <span className="text-white font-medium text-xs">₹{va.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/30 rounded px-2 py-1.5">
            <span className="text-blue-400 font-semibold text-xs">Avg:</span>
            <span className="text-white font-medium text-xs">
              {dailyAverage ? `₹${dailyAverage.toFixed(0)}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
