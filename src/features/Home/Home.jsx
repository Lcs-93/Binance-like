import { useState, useEffect } from 'react'
import MiniChart from '../../components/MiniChart/MiniChart'
import { RiWallet3Line, RiCoinLine, RiArrowRightLine } from 'react-icons/ri'

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

const Home = () => {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const portfolioData = {
    totalValue: 125750.82,
    dailyChange: 2.34,
    cryptoValue: 98250.42,
    cashValue: 27500.40
  }

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

  useEffect(() => {
    fetchCryptoData()
    const intervalId = setInterval(fetchCryptoData, REFRESH_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  if (loading && !cryptos.length) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="border-y border-gray">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-gray-400 text-sm">Total Portfolio Value</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">
                  ${portfolioData.totalValue.toLocaleString()}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${portfolioData.dailyChange >= 0
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-red-900/50 text-red-400'
                  }`}>
                  {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange}%
                </span>
              </div>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-400">
                Last updated: {lastUpdate}
              </div>
            )}
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
                  ${portfolioData.cryptoValue.toLocaleString()}
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
                  ${portfolioData.cashValue.toLocaleString()}
                </div>
                <RiArrowRightLine size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Cryptocurrency Prices</h1>
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
              {cryptos.map(crypto => {
                const priceChange = parseFloat(crypto.percent_change_24h)
                const chartColor = priceChange >= 0 ? '#22c55e' : '#ef4444'

                return (
                  <tr
                    key={crypto.id}
                    className="border-b border-gray hover:bg-gray/50 transition-colors cursor-pointer"
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
                      <div className="flex justify-center items-center">
                        <MiniChart
                          data={crypto}
                          color={chartColor}
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
      </div>
    </div>
  )
}

export default Home
