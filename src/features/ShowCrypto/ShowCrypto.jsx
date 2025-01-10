import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Chart from '../../components/Chart/Chart'
import MiniChart from '../../components/MiniChart/MiniChart'
import { RiArrowRightLine, RiSendPlaneFill, RiWallet3Line } from 'react-icons/ri'
import Toast from '../../components/Toast/Toast';

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

const calculatePriceAtChange = (currentPrice, percentChange) => {
  const price = parseFloat(currentPrice)
  const change = parseFloat(percentChange)
  return price / (1 + change / 100)
}

const ShowCrypto = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [crypto, setCrypto] = useState(null)
  const [similarCryptos, setSimilarCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([])
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [saleAmount, setSaleAmount] = useState('')
  const [activeUser, setActiveUser] = useState(null)
  const [isBuying, setIsBuying] = useState(true)
  const [isLimitOrder, setIsLimitOrder] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  })
  const [limitPrice, setLimitPrice] = useState('')
  const [limitOrders, setLimitOrders] = useState([])
  const [limitDate, setLimitDate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${id}`)
        const data = await response.json()
        if (data && data.length > 0) {
          setCrypto(data[0])
          const storedComments = JSON.parse(localStorage.getItem(`crypto-comments-${id}`)) || []
          setComments(storedComments)
          const allCryptosResponse = await fetch('https://api.coinlore.net/api/tickers/')
          const allCryptosData = await allCryptosResponse.json()
          if (allCryptosData && allCryptosData.data) {
            const currentPrice = parseFloat(data[0].price_usd)
            const sortedCryptos = allCryptosData.data
              .filter(c => c.id !== id)
              .sort((a, b) => {
                const priceA = parseFloat(a.price_usd)
                const priceB = parseFloat(b.price_usd)
                const diffA = Math.abs(priceA - currentPrice)
                const diffB = Math.abs(priceB - currentPrice)
                return diffA - diffB
              })

            const similar = sortedCryptos.slice(0, 5)
            setSimilarCryptos(similar)
          }
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'))
    setActiveUser(user)
    const storedLimitOrders = JSON.parse(localStorage.getItem(`limit-orders-${user?.email}`)) || []
    setLimitOrders(storedLimitOrders)
  }, [])

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      cryptoPrice: parseFloat(crypto.price_usd)
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments))
    setNewComment('')
  }

  const handlePurchase = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const totalCost = amount * parseFloat(crypto.price_usd);
    if (totalCost > activeUser.cash) {
      showToast('Fonds insuffisants pour cet achat', 'error');
      return;
    }

    const updatedCash = activeUser.cash - totalCost;
    
    const updatedCryptos = { ...activeUser.cryptos };
    updatedCryptos[crypto.symbol] = (updatedCryptos[crypto.symbol] || 0) + amount;

    const updatedUser = {
      ...activeUser,
      cash: updatedCash,
      cryptos: updatedCryptos
    };
    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
    setPurchaseAmount('');
    setError(null);
    showToast(`Achat de ${amount} ${crypto.symbol} effectué avec succès pour $${totalCost.toFixed(2)}`);
  };

  const handleSale = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const currentAmount = activeUser.cryptos?.[crypto.symbol] || 0;
    
    if (amount > currentAmount) {
      showToast(`Vous ne possédez que ${currentAmount} ${crypto.symbol}`, 'error');
      return;
    }

    const totalValue = amount * parseFloat(crypto.price_usd);
    const updatedCash = activeUser.cash + totalValue;
    const updatedCryptos = { ...activeUser.cryptos };
    
    if (!updatedCryptos[crypto.symbol]) {
      updatedCryptos[crypto.symbol] = 0;
    }
    
    updatedCryptos[crypto.symbol] = currentAmount - amount;

    if (updatedCryptos[crypto.symbol] === 0) {
      delete updatedCryptos[crypto.symbol];
    }

    const updatedUser = {
      ...activeUser,
      cash: updatedCash,
      cryptos: updatedCryptos
    };

    updateUserData(updatedUser);
    showToast(`Vente de ${amount} ${crypto.symbol} effectuée avec succès pour $${totalValue.toFixed(2)}`);
  };

  const getMaxPurchaseAmount = () => {
    if (!activeUser || !crypto) return 0;
    return activeUser.cash / parseFloat(crypto.price_usd);
  };

  const getMaxSaleAmount = () => {
    if (!activeUser || !crypto) return 0;
    return activeUser.cryptos?.[crypto.symbol] || 0;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    if (value === '') {
      isBuying ? setPurchaseAmount('') : setSaleAmount('');
      return;
    }

    const numValue = parseFloat(value);
    const maxAmount = isBuying 
      ? getMaxPurchaseAmount()
      : getMaxSaleAmount();

    if (numValue > maxAmount) {
      isBuying ? setPurchaseAmount(maxAmount.toString()) : setSaleAmount(maxAmount.toString());
    } else {
      isBuying ? setPurchaseAmount(value) : setSaleAmount(value);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleTransaction = () => {
    if (isBuying) {
      handlePurchase();
    } else {
      handleSale();
    }
  };

  const updateUserData = (updatedUser) => {
    localStorage.setItem('activeUser', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(user => 
      user.email === updatedUser.email ? updatedUser : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setActiveUser(updatedUser);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleLimitOrder = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(purchaseAmount);
    const price = parseFloat(limitPrice);
    const expiryDate = new Date(limitDate);

    if (isNaN(amount) || amount <= 0) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    if (isNaN(price) || price <= 0) {
      showToast('Veuillez entrer un prix limite valide', 'error');
      return;
    }

    if (!limitDate || expiryDate < new Date()) {
      showToast('Veuillez entrer une date limite valide', 'error');
      return;
    }

    const totalCost = amount * price;
    if (totalCost > activeUser.cash) {
      showToast('Fonds insuffisants pour cet ordre limite', 'error');
      return;
    }

    const newLimitOrder = {
      id: Date.now(),
      cryptoId: crypto.id,
      symbol: crypto.symbol,
      amount,
      limitPrice: price,
      totalCost,
      userEmail: activeUser.email,
      status: 'active',
      expiryDate: expiryDate.toISOString()
    };

    const updatedLimitOrders = [...limitOrders, newLimitOrder];
    localStorage.setItem(`limit-orders-${activeUser.email}`, JSON.stringify(updatedLimitOrders));
    setLimitOrders(updatedLimitOrders);
    setPurchaseAmount('');
    setLimitPrice('');
    setLimitDate('');
    setIsLimitOrder(false);

    showToast(`Ordre limite placé pour ${amount} ${crypto.symbol} à $${price}, valable jusqu'au ${new Date(limitDate).toLocaleDateString()}`);
  };

  useEffect(() => {
    if (!crypto || !activeUser || limitOrders.length === 0) return;

    const currentPrice = parseFloat(crypto.price_usd);
    const currentDate = new Date();
    
    const userLimitOrders = limitOrders.filter(order => 
      order.status === 'active' && 
      order.userEmail === activeUser.email &&
      order.cryptoId === crypto.id &&
      new Date(order.expiryDate) > currentDate
    );

    userLimitOrders.forEach(order => {
      if (currentPrice <= order.limitPrice) {
        // Exécuter l'ordre
        const updatedCash = activeUser.cash - order.totalCost;
        const updatedCryptos = { ...activeUser.cryptos };
        updatedCryptos[order.symbol] = (updatedCryptos[order.symbol] || 0) + order.amount;

        const updatedUser = {
          ...activeUser,
          cash: updatedCash,
          cryptos: updatedCryptos
        };

        localStorage.setItem('activeUser', JSON.stringify(updatedUser));
        setActiveUser(updatedUser);

        const updatedOrders = limitOrders.map(o => 
          o.id === order.id ? { ...o, status: 'executed' } : o
        );
        localStorage.setItem(`limit-orders-${activeUser.email}`, JSON.stringify(updatedOrders));
        setLimitOrders(updatedOrders);

        showToast(`Ordre limite exécuté : Achat de ${order.amount} ${order.symbol} à $${order.limitPrice}`);
      }
    });

    // Mettre à jour les ordres expirés
    const expiredOrders = limitOrders.filter(order => 
      order.status === 'active' && 
      new Date(order.expiryDate) <= currentDate
    );

    if (expiredOrders.length > 0) {
      const updatedOrders = limitOrders.map(order => 
        new Date(order.expiryDate) <= currentDate && order.status === 'active'
          ? { ...order, status: 'expired' }
          : order
      );
      localStorage.setItem(`limit-orders-${activeUser.email}`, JSON.stringify(updatedOrders));
      setLimitOrders(updatedOrders);
    }
  }, [crypto?.price_usd]);

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8">Error: {error}</div>
  if (!crypto) return <div className="p-8">No data found</div>

  const priceChange = parseFloat(crypto.percent_change_24h)
  const chartColor = priceChange >= 0 ? '#10B981' : '#EF4444'

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
          alt={crypto.name}
          className="w-16 h-16 rounded-full"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=64&bold=true`
          }}
        />
        <div>
          <h1 className="text-3xl font-bold text-white">{crypto.name}</h1>
          <div className="text-lg text-gray-400">{crypto.symbol}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <div className="bg-gray/20 p-6 rounded-lg">
            <div className="text-gray-400 mb-2">Price</div>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-bold text-white">
                ${parseFloat(crypto.price_usd).toLocaleString()}
              </div>
              <span className={`px-2 py-1 rounded ${priceChange >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray/20 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Market Cap</div>
              <div className="text-xl font-medium text-white">
                ${formatNumber(parseFloat(crypto.market_cap_usd))}
              </div>
            </div>
            <div className="bg-gray/20 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Volume (24h)</div>
              <div className="text-xl font-medium text-white">
                ${formatNumber(parseFloat(crypto.volume24))}
              </div>
            </div>
            <div className="bg-gray/20 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Circulating Supply</div>
              <div className="text-xl font-medium text-white">
                {formatNumber(parseFloat(crypto.csupply))} {crypto.symbol}
              </div>
            </div>
            <div className="bg-gray/20 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Total Supply</div>
              <div className="text-xl font-medium text-white">
                {formatNumber(parseFloat(crypto.tsupply))} {crypto.symbol}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{crypto.name}</h1>
            <span className="text-sm text-gray-400">{crypto.symbol}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Chart 
              data={crypto} 
              color="#cdaf3a"
              height={400}
              showTooltip={true}
              showAxis={true}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-gray/20 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Transaction</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsBuying(true);
                      setIsLimitOrder(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      isBuying && !isLimitOrder ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => {
                      setIsBuying(false);
                      setIsLimitOrder(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      !isBuying && !isLimitOrder ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Sell
                  </button>
                  <button
                    onClick={() => {
                      setIsBuying(true);
                      setIsLimitOrder(true);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      isLimitOrder ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>
              {isLimitOrder ? (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm mb-2">Montant ({crypto.symbol})</label>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      placeholder={`Entrez le montant en ${crypto.symbol}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Prix limite (USD)</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      placeholder="Entrez le prix limite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Date limite</label>
                    <input
                      type="datetime-local"
                      value={limitDate}
                      onChange={(e) => setLimitDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    Coût total estimé: ${((parseFloat(purchaseAmount) || 0) * (parseFloat(limitPrice) || 0)).toFixed(2)}
                  </div>
                  <button
                    onClick={handleLimitOrder}
                    disabled={!purchaseAmount || !limitPrice || !limitDate}
                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Placer l'ordre limite
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm mb-2">
                      {isBuying ? 'Available Cash' : `${crypto.symbol} Available`}
                    </label>
                    <div className="text-xl font-bold">
                      {isBuying 
                        ? `$${activeUser?.cash?.toFixed(2) || '0.00'}`
                        : `${activeUser?.cryptos?.[crypto.symbol]?.toFixed(8) || '0.00000000'} ${crypto.symbol}`
                      }
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Amount in {crypto.symbol}
                    </label>
                    <input
                      type="number"
                      value={isBuying ? purchaseAmount : saleAmount}
                      onChange={handleAmountChange}
                      min="0"
                      max={isBuying ? getMaxPurchaseAmount() : getMaxSaleAmount()}
                      step="any"
                      placeholder={isBuying 
                        ? `Max: ${getMaxPurchaseAmount().toFixed(8)}`
                        : `Max: ${getMaxSaleAmount().toFixed(8)}`
                      }
                      className="w-full bg-gray/10 p-2 rounded border border-gray/20 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {(isBuying ? purchaseAmount : saleAmount) && (
                    <div className="p-4 bg-background rounded">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Total Value</span>
                        <span className="font-medium">
                          ${(parseFloat(isBuying ? purchaseAmount : saleAmount) * parseFloat(crypto.price_usd)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleTransaction}
                    disabled={!activeUser || !(isBuying ? purchaseAmount : saleAmount) || parseFloat(isBuying ? purchaseAmount : saleAmount) <= 0}
                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuying ? 'Buy' : 'Sell'} {crypto.symbol}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400">Last Hour</div>
              <div className={`${parseFloat(crypto.percent_change_1h) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
                {parseFloat(crypto.percent_change_1h) >= 0 ? '+' : ''}{crypto.percent_change_1h}%
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_1h).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {parseFloat(crypto.percent_change_1h) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
            </div>
          </div>

          <div className="bg-gray/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400">Last 24 Hours</div>
              <div className={`${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
                {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}{crypto.percent_change_24h}%
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_24h).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {parseFloat(crypto.percent_change_24h) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
            </div>
          </div>

          <div className="bg-gray/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400">Last 7 Days</div>
              <div className={`${parseFloat(crypto.percent_change_7d) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
                {parseFloat(crypto.percent_change_7d) >= 0 ? '+' : ''}{crypto.percent_change_7d}%
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              ${calculatePriceAtChange(crypto.price_usd, crypto.percent_change_7d).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {parseFloat(crypto.percent_change_7d) >= 0 ? 'Increased' : 'Decreased'} from ${parseFloat(crypto.price_usd).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xl font-medium text-white">Similar Cryptocurrencies</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {similarCryptos.map(crypto => (
            <div
              key={crypto.id}
              className="bg-gray/20 p-4 rounded-lg cursor-pointer hover:bg-gray/30 transition-colors"
              onClick={() => navigate(`/crypto/${crypto.id}`)}
            >
              <div className="flex items-center gap-3 mb-2">
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
              <div className="h-[60px] mb-2">
                <MiniChart
                  data={crypto}
                  color={parseFloat(crypto.percent_change_24h) >= 0 ? '#10B981' : '#EF4444'}
                  height={60}
                />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-medium">${parseFloat(crypto.price_usd).toLocaleString()}</div>
                  <div className={`text-sm ${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}{crypto.percent_change_24h}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xl font-medium text-white mb-4">Comments</div>
        
        <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray/50 rounded-lg py-2 px-4 text-white placeholder-gray-light focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="bg-primary hover:bg-primary/90 text-background px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiSendPlaneFill />
            Send
          </button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-gray-light text-center py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray/20 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-light">
                    {formatDate(comment.timestamp)}
                  </div>
                  <div className="text-sm text-gray-light">
                    Price: ${comment.cryptoPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-white">{comment.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
      {limitOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Ordres limites</h3>
          <div className="space-y-4">
            {limitOrders
              .filter(order => order.userEmail === activeUser?.email)
              .map(order => (
                <div key={order.id} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">
                        {order.amount} {order.symbol} @ ${order.limitPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: ${order.totalCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expire le: {new Date(order.expiryDate).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {order.status}
                      </p>
                    </div>
                    {order.status === 'active' && (
                      <button
                        onClick={() => {
                          const updatedOrders = limitOrders.map(o => 
                            o.id === order.id ? { ...o, status: 'cancelled' } : o
                          );
                          localStorage.setItem(`limit-orders-${activeUser.email}`, JSON.stringify(updatedOrders));
                          setLimitOrders(updatedOrders);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  )
}

export default ShowCrypto
