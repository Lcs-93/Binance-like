import React, { useState, useEffect } from 'react'

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
      <div className="flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-gray-800">Cryptocurrency Prices</h1>
        {lastUpdate && (
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptos.map(crypto => (
          <div 
            key={crypto.id} 
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{crypto.name} ({crypto.symbol})</h2>
              <span className={`px-2 py-1 rounded ${
                parseFloat(crypto.percent_change_24h) >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {crypto.percent_change_24h}%
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700">
                Price: ${parseFloat(crypto.price_usd).toLocaleString()}
              </p>
              <p className="text-gray-700">
                Market Cap: ${parseFloat(crypto.market_cap_usd).toLocaleString()}
              </p>
              <p className="text-gray-700">
                Volume 24h: ${parseFloat(crypto.volume24).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
