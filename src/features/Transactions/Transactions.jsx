import { useState, useEffect, useCallback } from 'react'
import { RiSearchLine, RiArrowUpLine, RiArrowDownLine, RiExchangeDollarLine, RiMoneyDollarCircleLine, RiExchangeLine } from 'react-icons/ri'
import { getTransactions } from '../../utils/transactionUtils'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const TransactionIcon = ({ type }) => {
  switch (type) {
    case 'buy':
      return <RiArrowDownLine className="text-green-500" size={20} />
    case 'sell':
      return <RiArrowUpLine className="text-red-500" size={20} />
    case 'deposit':
      return <RiMoneyDollarCircleLine className="text-blue-500" size={20} />
    case 'withdrawal':
      return <RiExchangeDollarLine className="text-yellow-500" size={20} />
    case 'external_exchange_sent':
      return <RiExchangeLine className="text-purple-500" size={20} />
    case 'external_exchange_received':
      return <RiExchangeLine className="text-green-500" size={20} />
    default:
      return null
  }
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [cryptoPrices, setCryptoPrices] = useState({})
  const [activeUser, setActiveUser] = useState(null)

  const loadTransactions = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('activeUser'))
      setActiveUser(user)
      
      if (!user) {
        setTransactions([])
        return
      }

      const userTransactions = getTransactions()
      setTransactions(userTransactions)
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error)
    }
  }, [])

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('https://api.coinlore.net/api/tickers/')
        const data = await response.json()
        if (data && data.data) {
          const prices = {}
          data.data.forEach(crypto => {
            prices[crypto.symbol] = parseFloat(crypto.price_usd)
          })
          setCryptoPrices(prices)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des prix:', error)
      }
    }

    fetchCryptoPrices()
    const interval = setInterval(fetchCryptoPrices, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'transactions' || e.key === 'deposits' || e.key === 'withdrawals') {
        loadTransactions()
      }
    }

    loadTransactions()

    const interval = setInterval(loadTransactions, 5000)

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('transactionUpdated', loadTransactions)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('transactionUpdated', loadTransactions)
    }
  }, [loadTransactions])

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false
    
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      transaction.type?.toLowerCase().includes(searchLower) ||
      (transaction.cryptoName && transaction.cryptoName.toLowerCase().includes(searchLower))
    
    if (filter === 'all') {
      return matchesSearch
    }
    return matchesSearch && transaction.type === filter
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Historique des transactions</h2>
        {!activeUser ? (
          <div className="text-gray-400">Connectez-vous pour voir vos transactions</div>
        ) : (
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray/20 text-white px-4 py-2 rounded-lg"
            >
              <option value="all">Tous les types</option>
              <option value="buy">Achats</option>
              <option value="sell">Ventes</option>
              <option value="deposit">Dépôts</option>
              <option value="withdrawal">Retraits</option>
              <option value="external_exchange_sent">Envois</option>
              <option value="external_exchange_received">Réceptions</option>
            </select>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-64 bg-gray/20 text-white pl-10 pr-4 py-2 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {!activeUser ? null : (
        <div className="bg-gray/20 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray text-sm text-gray-400">
            <div>Date</div>
            <div>Type</div>
            <div>Crypto</div>
            <div className="text-right">Montant</div>
            <div className="text-right">Prix</div>
            <div className="text-right">Total</div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Aucune transaction trouvée
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-6 gap-4 p-4 hover:bg-gray/30 transition-colors items-center"
              >
                <div className="text-sm text-gray-300">
                  {formatDate(transaction.date)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TransactionIcon type={transaction.type} />
                  </div>
                  <span className="text-white">
                    {transaction.type === 'buy' && 'Achat'}
                    {transaction.type === 'sell' && 'Vente'}
                    {transaction.type === 'deposit' && 'Dépôt'}
                    {transaction.type === 'withdrawal' && 'Retrait'}
                    {transaction.type === 'external_exchange_sent' && 'Envoi'}
                    {transaction.type === 'external_exchange_received' && 'Réception'}
                  </span>
                </div>
                <div className="text-gray-400">
                  {transaction.cryptoName || '-'}
                </div>
                <div className="text-right text-white">
                  {transaction.amount ? (
                    <>
                      {transaction.amount} {transaction.cryptoName || 'USD'}
                      {transaction.type === 'external_exchange_sent' && (
                        <div className="text-xs text-gray-400">
                          à {transaction.recipient}
                        </div>
                      )}
                      {transaction.type === 'external_exchange_received' && (
                        <div className="text-xs text-gray-400">
                          de {transaction.sender}
                        </div>
                      )}
                    </>
                  ) : '-'}
                </div>
                <div className="text-right text-white">
                  {transaction.price ? formatCurrency(transaction.price) : (
                    (transaction.type === 'external_exchange_sent' || transaction.type === 'external_exchange_received') && cryptoPrices[transaction.cryptoName] ? 
                    formatCurrency(cryptoPrices[transaction.cryptoName]) : 
                    '-'
                  )}
                </div>
                <div className="text-right text-white">
                  {(transaction.type === 'external_exchange_sent' || transaction.type === 'external_exchange_received') && cryptoPrices[transaction.cryptoName] ? 
                    formatCurrency(transaction.amount * cryptoPrices[transaction.cryptoName]) :
                    formatCurrency(transaction.total)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Transactions
