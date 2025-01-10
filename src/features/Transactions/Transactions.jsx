import { useState, useEffect, useCallback } from 'react'
import { RiSearchLine, RiArrowUpLine, RiArrowDownLine, RiExchangeDollarLine, RiMoneyDollarCircleLine } from 'react-icons/ri'

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
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
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
    default:
      return null
  }
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const loadTransactions = useCallback(() => {
    try {
      const allTransactions = []
      
      const cryptoTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      allTransactions.push(...cryptoTransactions)
      
      const deposits = JSON.parse(localStorage.getItem('deposits') || '[]')
      deposits.forEach(deposit => {
        allTransactions.push({
          id: deposit.id || crypto.randomUUID(),
          type: 'deposit',
          amount: deposit.amount,
          total: deposit.amount,
          date: deposit.date || new Date().toISOString(),
          status: 'completed'
        })
      })
      
      const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]')
      withdrawals.forEach(withdrawal => {
        allTransactions.push({
          id: withdrawal.id || crypto.randomUUID(),
          type: 'withdrawal',
          amount: withdrawal.amount,
          total: withdrawal.amount,
          date: withdrawal.date || new Date().toISOString(),
          status: 'completed'
        })
      })

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(allTransactions)
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error)
    }
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
      </div>

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
                </span>
              </div>
              <div className="text-gray-400">
                {transaction.cryptoName || '-'}
              </div>
              <div className="text-right text-white">
                {transaction.amount ? `${transaction.amount} ${transaction.cryptoName || 'EUR'}` : '-'}
              </div>
              <div className="text-right text-white">
                {transaction.price ? formatCurrency(transaction.price) : '-'}
              </div>
              <div className="text-right text-white">
                {formatCurrency(transaction.total)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Transactions
