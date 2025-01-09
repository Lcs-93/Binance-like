import { useState, useEffect } from 'react'
import { RiSearchLine, RiArrowRightLine } from 'react-icons/ri'
import MiniChart from '../../components/MiniChart/MiniChart'

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

const Market = () => {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coinlore.net/api/tickers/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setCryptos(data.data)
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

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !cryptos.length) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="relative ">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search cryptocurrency..."
          className="w-full bg-gray/50 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filteredCryptos.map(crypto => {
          const priceChange = parseFloat(crypto.percent_change_24h)
          const chartColor = priceChange >= 0 ? '#22c55e' : '#ef4444'

          return (
            <div
              key={crypto.id}
              className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer px-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <img
                    src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                    alt={crypto.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=24&bold=true`
                    }}
                  />
                </div>
                <div>
                  <div className="text-white font-medium">{crypto.name}</div>
                  <div className="text-sm text-gray-400">{crypto.symbol}</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-24 h-12">
                  <MiniChart data={crypto} color={chartColor} />
                </div>
                <div className="w-32 text-right">
                  <div className="text-white font-medium">
                    ${parseFloat(crypto.price_usd).toLocaleString()}
                  </div>
                  <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange}%
                  </div>
                </div>
                <div className="text-right w-32">
                  <div className="text-white font-medium">
                    ${formatNumber(parseFloat(crypto.market_cap_usd))}
                  </div>
                  <div className="text-sm text-gray-400">Market Cap</div>
                </div>
                <div className="text-right w-32">
                  <div className="text-white font-medium">
                    ${formatNumber(parseFloat(crypto.volume24))}
                  </div>
                  <div className="text-sm text-gray-400">Volume 24h</div>
                </div>
                <RiArrowRightLine size={18} className="text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Market
