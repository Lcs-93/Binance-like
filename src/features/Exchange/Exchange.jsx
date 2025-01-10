import { useState, useEffect } from 'react'
import { RiSearchLine, RiArrowRightLine } from 'react-icons/ri'
import ReactCountryFlag from 'react-country-flag'

const REFRESH_INTERVAL = 5000

const countryToCode = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'China': 'CN',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Singapore': 'SG',
  'Hong Kong': 'HK',
  'Malta': 'MT',
  'Seychelles': 'SC',
  'British Virgin Islands': 'VG',
  'Mexico': 'MX',
  'Luxembourg': 'LU',
  'Switzerland': 'CH',
  'Czech Republic': 'CZ',
  'Germany': 'DE',
  'Netherlands': 'NL',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Canada': 'CA',
  'France': 'FR',
  'Belgium': 'BE',
  'Italy': 'IT',
  'Sweden': 'SE',
  'Denmark': 'DK',
  'Norway': 'NO',
  'Ireland': 'IE',
  'Estonia': 'EE',
  'Turkey': 'TR',
  'US': 'US',
  'Brazil': 'BR',
  'UK': 'GB',
  'Russia': 'RU',
  'India': 'IN',
  'Korea': 'KR',
  'HK': 'HK',
  'Indonesia': 'ID',
  'Ukraine': 'UA',
  'Panama': 'PA',
  'Cayman Islands': 'KY',
  'Thailand': 'TH',
  'Malaysia': 'MY',
  'South African': 'ZA',
  'Vietnam': 'VN',
  'Chile': 'CL',
  'United Arab Emirates': 'AE',
  'Taiwan': 'TW',
  'Israel': 'IL',
  'Belarus': 'BY',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Poland': 'PL',
}

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

const Exchange = () => {
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchExchangeData = async () => {
    try {
      const response = await fetch('https://api.coinlore.net/api/exchanges/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      const exchangesArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
        volume_usd: value.volume_usd || '0',
        pair_count: value.pair_count || '0'
      })).filter(exchange => exchange.name && exchange.volume_usd)
      setExchanges(exchangesArray)
      setError(null)
    } catch (error) {
      console.error('Error fetching exchanges:', error)
      setError('Unable to load exchanges data. Please try again later.')
      setExchanges([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExchangeData()
    const intervalId = setInterval(fetchExchangeData, REFRESH_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  const filteredExchanges = exchanges.filter(exchange =>
    exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exchange.country && exchange.country.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && !exchanges.length) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by exchange or country..."
          className="w-full bg-gray/50 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filteredExchanges.map(exchange => {
          const countryCode = countryToCode[exchange.country] || 'UN'
          
          return (
            <div
              key={exchange.id}
              className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div>
                  <div className="text-white font-medium">{exchange.name}</div>
                  <div className="text-sm text-gray-400">Exchange</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right w-32">
                  <div className="text-white font-medium">
                    ${formatNumber(parseFloat(exchange.volume_usd || 0))}
                  </div>
                  <div className="text-sm text-gray-400">Volume 24h</div>
                </div>
                <div className="text-right w-32">
                  <div className="text-white font-medium">
                    {formatNumber(parseFloat(exchange.pair_count || 0))}
                  </div>
                  <div className="text-sm text-gray-400">Pairs</div>
                </div>
                <div className="text-right w-32">
                  <div className="text-white font-medium">
                    {exchange.country || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-400">Country</div>
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

export default Exchange
