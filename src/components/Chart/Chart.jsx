import { AreaChart, Area, YAxis, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

const Chart = ({ 
  data: cryptoData, 
  color, 
  width = "100%", 
  height = 400
}) => {
  const basePrice = parseFloat(cryptoData.price_usd)
  const change1h = parseFloat(cryptoData.percent_change_1h) / 100
  const change24h = parseFloat(cryptoData.percent_change_24h) / 100
  const change7d = parseFloat(cryptoData.percent_change_7d) / 100

  const price7d = basePrice / (1 + change7d)
  const price24h = basePrice / (1 + change24h)
  const price1h = basePrice / (1 + change1h)

  const generateChartData = () => {
    const now = Date.now()
    const hourInMs = 3600000
    const data = []

    for (let i = 0; i < 40; i++) {
      const timestamp = new Date(now - (40 - i) * hourInMs).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      })

      let value
      const position = i / 39

      if (position <= 0.3) {
        value = price7d + (price24h - price7d) * (position / 0.3)
      } else if (position <= 0.6) {
        const subPosition = (position - 0.3) / 0.3
        value = price24h + (price1h - price24h) * subPosition
      } else {
        const subPosition = (position - 0.6) / 0.4
        value = price1h + (basePrice - price1h) * subPosition
      }

      const noise = value * (1 + (Math.random() - 0.5) * 0.002)
      
      data.push({
        timestamp,
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
    minValue - (valueRange * 0.1),
    maxValue + (valueRange * 0.1)
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 border border-gray rounded p-2">
          <p className="text-white">${payload[0].value.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">{payload[0].payload.timestamp}</p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="timestamp" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          interval="preserveStartEnd"
        />
        <YAxis 
          domain={yAxisDomain}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          tickFormatter={formatYAxis}
          allowDataOverflow={true}
          width={60}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'white', strokeWidth: 1, strokeOpacity: 0.1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#gradient-${color})`}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 1 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default Chart
