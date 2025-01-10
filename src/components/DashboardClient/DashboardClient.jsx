import { useEffect, useState } from "react";

const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B'
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K'
  }
  return num.toFixed(2)
}

const DashboardClient = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [topCryptos, setTopCryptos] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('https://api.coinlore.net/api/tickers/');
      const data = await response.json();
      if (data && data.data) {
        const prices = {};
        data.data.forEach(crypto => {
          prices[crypto.symbol] = parseFloat(crypto.price_usd);
        });
        setCryptoPrices(prices);
        updateTopCryptos(prices);
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTopCryptos = (prices) => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    if (user && user.cryptos) {
      const cryptosWithValue = Object.entries(user.cryptos)
        .map(([symbol, amount]) => ({
          symbol,
          amount,
          value: (prices[symbol] || 0) * amount
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);
      
      setTopCryptos(cryptosWithValue);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    setActiveUser(user);

    const userTransactions = localStorage.getItem(`transactions-${user?.email}`) || '[]';
    setTransactions(JSON.parse(userTransactions));

    fetchCryptoPrices();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchCryptoPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Informations personnelles</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray/20 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Pseudo</div>
          <div className="text-xl font-medium text-white">
            {activeUser?.username || "Non défini"}
          </div>
        </div>
        <div className="bg-gray/20 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Email</div>
          <div className="text-xl font-medium text-white">
            {activeUser?.email || "Non défini"}
          </div>
        </div>
        <div className="bg-gray/20 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Transactions</div>
          <div className="text-xl font-medium text-white">
            {transactions.length} 
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white">Mon top 3 crypto</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCryptos.length === 0 ? (
          <div className="text-gray-400">Aucune crypto détenue.</div>
        ) : (
          topCryptos.map((crypto, index) => (
            <div key={index} className="bg-gray/20 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                    alt={crypto.symbol}
                    className="w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=64&bold=true`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xl font-medium text-white">{crypto.symbol}</div>
                    <div className="text-sm text-gray-400">#{index + 1}</div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-400">Montant détenu</div>
                      <div className="text-lg font-bold text-white">
                        {crypto.amount.toFixed(8)} {crypto.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Prix actuel</div>
                      <div className="text-lg text-white">
                        ${loading ? "..." : (cryptoPrices[crypto.symbol] || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Valeur totale</div>
                      <div className="text-lg font-bold text-primary">
                        ${loading ? "..." : formatNumber(crypto.value)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardClient;