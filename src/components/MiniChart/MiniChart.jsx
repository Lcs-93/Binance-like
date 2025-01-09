import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

const MiniChart = ({ 
  data: cryptoData, 
  color, 
  width = "100%", 
  height = 60 
}) => {
  const generateChartData = () => {
    if (cryptoData.history && cryptoData.history.length > 0) {
      return cryptoData.history.map(h => ({
        value: h.price || h.value
      }));
    }

    const basePrice = parseFloat(cryptoData.price_usd)
    const change24h = parseFloat(cryptoData.percent_change_24h) / 100
    const price24h = basePrice / (1 + change24h)
    const data = []

    for (let i = 0; i < 20; i++) {
      const position = i / 19
      const value = price24h + (basePrice - price24h) * position
      const noise = value * (1 + (Math.random() - 0.5) * 0.003)
      data.push({
        value: noise
      })
    }

    return data
  }

  const chartData = generateChartData()
  
  const values = chartData.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue
  
  const yAxisDomain = [
    minValue - (valueRange * 0.05),
    maxValue + (valueRange * 0.05)
  ]

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis
          domain={yAxisDomain}
          hide
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fillOpacity={1}
          fill={`url(#gradient-${color})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default MiniChart
