import { useState, useEffect } from 'react'
import { RiSearchLine, RiArrowRightLine } from 'react-icons/ri'
import MiniChart from '../../components/MiniChart/MiniChart'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coinlore.net/api/tickers/')
      const data = await response.json()
      if (data && data.data) {
        setCryptos(data.data)
        setError(null)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search cryptocurrency..."
            className="w-full bg-gray/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-light" />
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          filteredCryptos.map(crypto => (
            <div
              key={crypto.id}
              className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer px-8"
              onClick={() => navigate(`/crypto/${crypto.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                    alt={crypto.name}
                    className="w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=32&bold=true`
                    }}
                  />
                </div>
                <div>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-sm text-gray-light">{crypto.symbol}</div>
                </div>
              </div>
              <div className="w-[120px]">
                <MiniChart 
                  data={crypto} 
                  color={parseFloat(crypto.percent_change_24h) >= 0 ? '#10B981' : '#EF4444'} 
                  width={120}
                />
              </div>
              <div className="flex items-center gap-8">
                <div className="w-32 text-right">
                  <div className="text-white font-medium">
                    ${parseFloat(crypto.price_usd).toLocaleString()}
                  </div>
                  <div className={`text-sm ${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}
                    {crypto.percent_change_24h}%
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
          ))
        )}
      </div>
    </div>
  )
}

export default Market
