const PriceStats = ({ crypto, calculatePriceAtChange }) => {
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-gray/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400">Last Hour</div>
          <div className={`${parseFloat(crypto.percent_change_1h) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
            {parseFloat(crypto.percent_change_1h) >= 0 ? '+' : ''}{crypto.percent_change_1h}%
          </div>
        </div>
        <div className="text-xl font-bold text-white">
          ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_1h).toLocaleString()}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {parseFloat(crypto.percent_change_1h) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
        </div>
      </div>

      <div className="bg-gray/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400">Last 24 Hours</div>
          <div className={`${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
            {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}{crypto.percent_change_24h}%
          </div>
        </div>
        <div className="text-xl font-bold text-white">
          ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_24h).toLocaleString()}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {parseFloat(crypto.percent_change_24h) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
        </div>
      </div>

      <div className="bg-gray/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400">Last 7 Days</div>
          <div className={`${parseFloat(crypto.percent_change_7d) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
            {parseFloat(crypto.percent_change_7d) >= 0 ? '+' : ''}{crypto.percent_change_7d}%
          </div>
        </div>
        <div className="text-xl font-bold text-white">
          ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_7d).toLocaleString()}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {parseFloat(crypto.percent_change_7d) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PriceStats;
