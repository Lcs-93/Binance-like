import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

const MiniChart = ({ 
  data: cryptoData, 
  color, 
  width = "100%", 
  height = 60 
}) => {
  const basePrice = parseFloat(cryptoData.price_usd)
  const change1h = parseFloat(cryptoData.percent_change_1h) / 100
  const change24h = parseFloat(cryptoData.percent_change_24h) / 100

  const price24h = basePrice / (1 + change24h)
  const price1h = basePrice / (1 + change1h)

  const generateChartData = () => {
    const now = Date.now()
    const hourInMs = 3600000
    const data = []

    for (let i = 0; i < 20; i++) {
      const position = i / 19
      let value

      if (position <= 0.5) {
        value = price24h + (price1h - price24h) * (position / 0.5)
      } else {
        const subPosition = (position - 0.5) / 0.5
        value = price1h + (basePrice - price1h) * subPosition
      }

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
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis 
          domain={yAxisDomain}
          hide={true}
          allowDataOverflow={true}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#gradient-${color})`}
          strokeWidth={1}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default MiniChart
