import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts'

const MiniChart = ({ data: cryptoData, color }) => {
  const basePrice = parseFloat(cryptoData.price_usd)
  const change1h = parseFloat(cryptoData.percent_change_1h) / 100
  const change24h = parseFloat(cryptoData.percent_change_24h) / 100
  const change7d = parseFloat(cryptoData.percent_change_7d) / 100

  const chartData = Array.from({ length: 20 }, (_, i) => {
    const position = i / 19 
    
    let priceChange
    if (position < 0.3) { 
      const mix = position / 0.3
      priceChange = change7d * (1 - mix) + change24h * mix
    } else if (position < 0.6) { 
      const mix = (position - 0.3) / 0.3
      priceChange = change24h * (1 - mix) + change1h * mix
    } else {
      const mix = (position - 0.6) / 0.4
      priceChange = change1h * (1 - mix)
    }

    return {
      value: basePrice * (1 + priceChange * (1 - position))
    }
  })

  return (
    <ResponsiveContainer width={120} height={40}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#gradient-${color})`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default MiniChart
