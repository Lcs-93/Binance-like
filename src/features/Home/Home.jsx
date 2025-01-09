import { useState, useEffect } from 'react'

const REFRESH_INTERVAL = 5000

const Home = () => {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Cryptocurrency Prices</h1>
        {lastUpdate && (
          <div className="text-sm text-gray-400">
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
              <th className="text-right py-4 px-4">Market Cap</th>
              <th className="text-right py-4 px-4">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map(crypto => (
              <tr 
                key={crypto.id}
                className="border-b border-gray hover:bg-gray/50 transition-colors"
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
                  <span className={`px-2 py-1 rounded ${
                    parseFloat(crypto.percent_change_24h) >= 0 
                      ? 'bg-green-900/50 text-green-400' 
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {crypto.percent_change_24h}%
                  </span>
                </td>
                <td className="text-right py-4 px-4 text-white">
                  ${parseFloat(crypto.market_cap_usd).toLocaleString()}
                </td>
                <td className="text-right py-4 px-4 text-white">
                  ${parseFloat(crypto.volume24).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Home
