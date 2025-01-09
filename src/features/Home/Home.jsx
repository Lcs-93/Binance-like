import { useState, useEffect } from 'react'
import MiniChart from '../../components/MiniChart/MiniChart'
import { RiWallet3Line, RiCoinLine, RiArrowRightLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'

const REFRESH_INTERVAL = 5000

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

const calculateChange = (currentValue, history) => {
  if (!history || history.length < 2) return 0;
  const previousValue = history[history.length - 2].value;
  return ((currentValue - previousValue) / previousValue) * 100;
}

const Home = () => {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [portfolioValue, setPortfolioValue] = useState({
    totalValue: 0,
    cryptoValue: 0,
    cashValue: 0,
    history: [],
    dailyChange: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    setActiveUser(user);

    const portfolioHistory = JSON.parse(localStorage.getItem(`portfolio_history_${user?.email}`)) || [];
    setPortfolioValue(prev => ({ ...prev, history: portfolioHistory }));
  }, []);

  useEffect(() => {
    if (activeUser && cryptos.length > 0) {
      const cashValue = activeUser.cash || 0;
      let cryptoValue = 0;

      Object.entries(activeUser.cryptos || {}).forEach(([symbol, amount]) => {
        const crypto = cryptos.find(c => c.symbol === symbol);
        if (crypto) {
          cryptoValue += amount * crypto.price_usd;
        }
      });

      const totalValue = cashValue + cryptoValue;

      const currentTime = new Date().toISOString();
      const newHistory = [...portfolioValue.history, { timestamp: currentTime, value: totalValue }]
        .slice(-24);

      const dailyChange = calculateChange(totalValue, newHistory);

      localStorage.setItem(`portfolio_history_${activeUser.email}`, JSON.stringify(newHistory));

      setPortfolioValue({
        cashValue,
        cryptoValue,
        totalValue,
        history: newHistory,
        dailyChange
      });
    }
  }, [activeUser, cryptos]);

  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem('activeUser'));
      if (user) {
        setActiveUser(user);
        const portfolioHistory = JSON.parse(localStorage.getItem(`portfolio_history_${user.email}`)) || [];
        setPortfolioValue(prev => ({ ...prev, history: portfolioHistory }));
      }
    };

    const interval = setInterval(() => {
      const user = JSON.parse(localStorage.getItem('activeUser'));
      if (user && (!activeUser || user.cash !== activeUser.cash || JSON.stringify(user.cryptos) !== JSON.stringify(activeUser.cryptos))) {
        setActiveUser(user);
      }
    }, 1000);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeUser]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coinlore.net/api/tickers/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setCryptos(data.data)
      setLastUpdate(new Date().toLocaleTimeString())
      setError(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !cryptos.length) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray p-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg">
              <div className="flex gap-4 items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2">Total Portfolio Value</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">
                      ${formatNumber(portfolioValue.totalValue)}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      portfolioValue.dailyChange >= 0
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {portfolioValue.dailyChange >= 0 ? '+' : ''}
                      {portfolioValue.dailyChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="w-32 h-16">
                  <MiniChart
                    data={{
                      price_usd: portfolioValue.totalValue,
                      percent_change_24h: portfolioValue.dailyChange,
                      history: portfolioValue.history
                    }}
                    color={portfolioValue.dailyChange >= 0 ? '#22c55e' : '#ef4444'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RiCoinLine size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Cryptos</div>
                </div>
              </div>
              <div className="flex items-center gap-40">
                <div className="text-xl font-medium text-white">
                  ${portfolioValue.cryptoValue.toLocaleString()}
                </div>
                <RiArrowRightLine size={18} className="text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RiWallet3Line size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Cash</div>
                </div>
              </div>
              <div className="flex items-center gap-40">
                <div className="text-xl font-medium text-white">
                  ${portfolioValue.cashValue.toLocaleString()}
                </div>
                <RiArrowRightLine size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='px-8'>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-white mb-4">Cryptocurrency Prices</h1>
          {lastUpdate && (
            <div className="text-sm text-primary/50">
              Last updated: {lastUpdate}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray">
                <th className="text-left py-4 px-4">Name</th>
                <th className="text-right py-4 px-4">Price</th>
                <th className="text-right py-4 px-4">24h %</th>
                <th className="text-center py-4 px-4">Chart</th>
                <th className="text-right py-4 px-4">Market Cap</th>
                <th className="text-right py-4 px-4">Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {cryptos.slice(0, 4).map(crypto => {
                const priceChange = parseFloat(crypto.percent_change_24h)
                const chartColor = priceChange >= 0 ? '#22c55e' : '#ef4444'

                return (
                  <tr
                    key={crypto.id}
                    className="border-b border-gray hover:bg-gray/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/crypto/${crypto.id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=32&bold=true`
                          }}
                        />
                        <div>
                          <div className="font-medium text-white">{crypto.name}</div>
                          <div className="text-sm text-gray-400">{crypto.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 text-white">
                      ${parseFloat(crypto.price_usd).toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`px-2 py-1 rounded ${priceChange >= 0
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                        }`}>
                        {priceChange}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-[120px]">
                        <MiniChart
                          data={crypto}
                          color={parseFloat(crypto.percent_change_24h) >= 0 ? '#10B981' : '#EF4444'}
                          width={120}
                        />
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      ${formatNumber(parseFloat(crypto.market_cap_usd))}
                    </td>
                    <td className="text-right py-4 px-4">
                      ${formatNumber(parseFloat(crypto.volume24))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Link to="/market" >
          <div className="text-md font-semibold bg-primary py-2 px-4 text-background text-center mt-8 rounded-lg">
            Aller au marché
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Home
