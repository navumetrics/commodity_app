import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export function SimpleStockCard({ stock, onClick }) {
  const { symbol, cash_data, base_data } = stock;
  
  const cp = cash_data?.CP || 0;
  const bspOptions = base_data?.BSP_OPTIONS || 0;
  const bspMaxOI = base_data?.BSP_MAX_OI || 0;
  const bspFutures = base_data?.BSP_FUTURES || 0;
  const bspTP = base_data?.BSP_TP || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
    >
      {/* Stock Name */}
      <div className="mb-3 pb-2 border-b border-slate-700">
        <h3 className="text-lg font-bold text-cyan-400">{symbol}</h3>
      </div>

      {/* CP Value */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Close Price</span>
          <span className="text-white font-semibold text-lg">₹{cp.toFixed(2)}</span>
        </div>
      </div>

      {/* BSP Values Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* BSP OPTIONS */}
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">BSP OPTIONS</div>
          <div className="text-green-400 font-semibold">{bspOptions.toFixed(2)}</div>
        </div>

        {/* BSP MAX OI */}
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">BSP MAX OI</div>
          <div className="text-green-400 font-semibold">{bspMaxOI.toFixed(2)}</div>
        </div>

        {/* BSP FUTURES */}
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">BSP FUTURES</div>
          <div className="text-green-400 font-semibold">{bspFutures.toFixed(2)}</div>
        </div>

        {/* BSP TP */}
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">BSP TP</div>
          <div className="text-green-400 font-semibold">{bspTP.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
}

SimpleStockCard.propTypes = {
  stock: PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    cash_data: PropTypes.shape({
      CP: PropTypes.number
    }),
    base_data: PropTypes.shape({
      BSP_OPTIONS: PropTypes.number,
      BSP_MAX_OI: PropTypes.number,
      BSP_FUTURES: PropTypes.number,
      BSP_TP: PropTypes.number
    })
  }).isRequired,
  onClick: PropTypes.func
};
