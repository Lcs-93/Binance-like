import { useNavigate } from 'react-router-dom';
import MiniChart from '../../../components/MiniChart/MiniChart';

const SimilarCryptos = ({ similarCryptos }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 mt-12 px-8">
      <div className="text-xl font-medium text-white">Similar Cryptocurrencies</div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {similarCryptos.map(crypto => (
          <div
            key={crypto.id}
            className="bg-gray/20 p-4 rounded-lg cursor-pointer hover:bg-gray/30 transition-colors"
            onClick={() => navigate(`/crypto/${crypto.id}`)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                  alt={crypto.name}
                  className="w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=32&bold=true`;
                  }}
                />
              </div>
              <div>
                <div className="font-medium">{crypto.name}</div>
                <div className="text-sm text-gray-light">{crypto.symbol}</div>
              </div>
            </div>
            <div className="h-[60px] mb-2">
              <MiniChart
                data={crypto}
                color={parseFloat(crypto.percent_change_24h) >= 0 ? '#10B981' : '#EF4444'}
                height={60}
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="font-medium">${parseFloat(crypto.price_usd).toLocaleString()}</div>
                <div className={`text-sm ${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}{crypto.percent_change_24h}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarCryptos;
