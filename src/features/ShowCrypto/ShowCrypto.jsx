import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Chart from '../../components/Chart/Chart'
import MiniChart from '../../components/MiniChart/MiniChart'
import { RiArrowRightLine, RiSendPlaneFill, RiWallet3Line, RiEditLine, RiDeleteBinLine, RiThumbUpLine, RiThumbUpFill, RiArrowUpLine, RiArrowUpFill, RiArrowDownLine, RiArrowDownFill } from 'react-icons/ri'
import Toast from '../../components/Toast/Toast'
import SimilarCryptos from './components/SimilarCryptos'
import CryptoComments from './components/CryptoComments'
import LimitOrders from './components/LimitOrders'
import PriceStats from './components/PriceStats'
import { addTransaction } from '../../utils/transactionUtils'

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
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  })
  const [limitPrice, setLimitPrice] = useState('')
  const [limitOrders, setLimitOrders] = useState([])
  const [limitDate, setLimitDate] = useState('')

  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      try {
        const now = Date.now()
        if (isInitial) setLoading(true)
        
        const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${id}`)
        const data = await response.json()
        if (data && data.length > 0) {
          setCrypto(data[0])
          setLastUpdate(now)
          
          if (isInitial) {
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
        }
        if (isInitial) setLoading(false)
      } catch (err) {
        setError(err.message)
        if (isInitial) setLoading(false)
      }
    }

    fetchData(true) // Chargement initial avec loading
    const interval = setInterval(() => fetchData(false), 5000) // Mises à jour sans loading
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'))
    setActiveUser(user)
    const storedLimitOrders = JSON.parse(localStorage.getItem(`limit-orders-${user?.email}`)) || []
    setLimitOrders(storedLimitOrders)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem('activeUser'))
      if (user?.lastUpdate !== activeUser?.lastUpdate) {
        setActiveUser(user)
      }
    }

    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('assetsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('assetsUpdated', handleStorageChange)
    }
  }, [activeUser])

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      cryptoPrice: parseFloat(crypto.price_usd),
      userId: activeUser?.id,
      username: activeUser?.username,
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleEditComment = (commentId, newText) => {
    const updatedComments = comments.map((comment) =>
      comment.id === commentId ? { ...comment, text: newText } : comment
    );
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter((comment) => comment.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

  const handleLikeComment = (commentId) => {
    if (!activeUser) return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const likes = comment.likes || [];
        const userIndex = likes.indexOf(activeUser.id);
        
        if (userIndex === -1) {
          return { ...comment, likes: [...likes, activeUser.id] };
        } else {
          return { 
            ...comment, 
            likes: [...likes.slice(0, userIndex), ...likes.slice(userIndex + 1)] 
          };
        }
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

  const handleVoteComment = (commentId, voteType) => {
    if (!activeUser) return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const votes = comment.votes || [];
        const existingVote = votes.find(v => v.userId === activeUser.id);
        
        if (!existingVote) {
          return {
            ...comment,
            votes: [...votes, { userId: activeUser.id, type: voteType }]
          };
        } else if (existingVote.type === voteType) {
          return {
            ...comment,
            votes: votes.filter(v => v.userId !== activeUser.id)
          };
        } else {
          return {
            ...comment,
            votes: votes.map(v => 
              v.userId === activeUser.id 
                ? { ...v, type: voteType }
                : v
            )
          };
        }
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

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
      cryptos: updatedCryptos,
      lastUpdate: Date.now()
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);

    addTransaction({
      type: 'buy',
      cryptoId: crypto.id,
      cryptoName: crypto.symbol,
      amount: amount,
      price: parseFloat(crypto.price_usd),
      total: totalCost,
      status: 'completed'
    });

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
      cryptos: updatedCryptos,
      lastUpdate: Date.now()
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);

    addTransaction({
      type: 'sell',
      cryptoId: crypto.id,
      cryptoName: crypto.symbol,
      amount: amount,
      price: parseFloat(crypto.price_usd),
      total: totalValue,
      status: 'completed'
    });

    setSaleAmount('');
    setError(null);
    showToast(`Vente de ${amount} ${crypto.symbol} effectuée avec succès pour $${totalValue.toFixed(2)}`);
  };

  const handleLimitOrder = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(purchaseAmount);
    const price = parseFloat(limitPrice);

    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
      showToast('Veuillez entrer des montants valides', 'error');
      return;
    }

    const totalCost = amount * price;
    if (totalCost > activeUser.cash) {
      showToast('Fonds insuffisants pour cet ordre', 'error');
      return;
    }

    const order = {
      id: Date.now().toString(),
      userEmail: activeUser.email,
      symbol: crypto.symbol,
      amount: amount,
      limitPrice: price,
      totalCost: totalCost,
      expiryDate: limitDate,
      status: 'pending',
      type: 'limit'
    };

    const updatedLimitOrders = [...limitOrders, order];
    localStorage.setItem(`limit-orders-${activeUser.email}`, JSON.stringify(updatedLimitOrders));
    setLimitOrders(updatedLimitOrders);

    addTransaction({
      type: 'buy',
      cryptoId: crypto.id,
      cryptoName: crypto.symbol,
      amount: amount,
      price: price,
      total: totalCost,
      status: 'pending'
    });

    setPurchaseAmount('');
    setLimitPrice('');
    setLimitDate('');
    showToast(`Ordre limite placé pour ${amount} ${crypto.symbol} à $${price}`);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <RiArrowRightLine className="transform rotate-180" size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{crypto.name}</h1>
          <div className="text-gray-400">{crypto.symbol}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray/20 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-white mb-4">
                  ${parseFloat(crypto.price_usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-lg ${parseFloat(crypto.percent_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(crypto.percent_change_24h) >= 0 ? '+' : ''}{crypto.percent_change_24h}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400">Market Cap</div>
                <div className="text-xl font-medium text-white">
                  ${formatNumber(crypto.market_cap_usd)}
                </div>
              </div>
            </div>
            <Chart
              data={crypto}
              color={parseFloat(crypto.percent_change_24h) >= 0 ? '#10B981' : '#EF4444'}
            />
          </div>
        </div>

        <div>
          <div className="bg-gray/20 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Volume 24h</div>
              <div className="text-white font-medium">${formatNumber(crypto.volume24)}</div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Circulating Supply</div>
              <div className="text-white font-medium">{formatNumber(crypto.csupply)} {crypto.symbol}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-400">Total Supply</div>
              <div className="text-white font-medium">{formatNumber(crypto.tsupply)} {crypto.symbol}</div>
            </div>
          </div>

          <div className="bg-gray/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <RiWallet3Line className="text-primary" />
              Trade
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsBuying(true);
                    setIsLimitOrder(false);
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    isBuying && !isLimitOrder ? 'bg-primary text-white' : 'bg-gray/50 text-gray-300'
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
                    !isBuying && !isLimitOrder ? 'bg-primary text-white' : 'bg-gray/50 text-gray-300'
                  }`}
                >
                  Sell
                </button>
                <button
                  onClick={() => {
                    setIsLimitOrder(true);
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    isLimitOrder ? 'bg-primary text-white' : 'bg-gray/50 text-gray-300'
                  }`}
                >
                  Limit
                </button>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">
                  {isLimitOrder ? 'Amount' : isBuying ? 'Buy Amount' : 'Sell Amount'}
                </label>
                <input
                  type="number"
                  value={isBuying ? purchaseAmount : saleAmount}
                  onChange={handleAmountChange}
                  min="0"
                  step="any"
                  className="w-full bg-gray/50 rounded-lg py-2 px-4 text-white"
                  placeholder={`Enter amount in ${crypto.symbol}`}
                />
              </div>

              {isLimitOrder && (
                <>
                  <div>
                    <label className="block text-gray-400 mb-2">Limit Price (USD)</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      min="0"
                      step="any"
                      className="w-full bg-gray/50 rounded-lg py-2 px-4 text-white"
                      placeholder="Enter limit price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={limitDate}
                      onChange={(e) => setLimitDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-gray/50 rounded-lg py-2 px-4 text-white"
                    />
                  </div>
                </>
              )}

              <div className="text-gray-400">
                Available: {isBuying 
                  ? `$${activeUser?.cash?.toFixed(2) || '0.00'}`
                  : `${activeUser?.cryptos?.[crypto.symbol]?.toFixed(8) || '0.00000000'} ${crypto.symbol}`
                }
              </div>

              <div className="text-gray-400">
                Total Cost: ${(
                  (parseFloat(isBuying ? purchaseAmount : saleAmount) || 0) * 
                  (isLimitOrder ? parseFloat(limitPrice) || 0 : parseFloat(crypto.price_usd))
                ).toFixed(2)}
              </div>

              <button
                onClick={isLimitOrder ? handleLimitOrder : handleTransaction}
                disabled={
                  !activeUser || 
                  !(isBuying ? purchaseAmount : saleAmount) || 
                  (isLimitOrder && (!limitPrice || !limitDate))
                }
                className="w-full bg-primary hover:bg-primary/90 text-background py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLimitOrder 
                  ? 'Place Limit Order' 
                  : `${isBuying ? 'Buy' : 'Sell'} ${crypto.symbol}`
                }
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="flex w-full">
        <PriceStats crypto={crypto} calculatePriceAtChange={calculatePriceAtChange} />
      </div>


      <CryptoComments
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        handleEditComment={handleEditComment}
        handleDeleteComment={handleDeleteComment}
        handleLikeComment={handleLikeComment}
        handleVoteComment={handleVoteComment}
        activeUser={activeUser}
        formatDate={(date) => new Date(date).toLocaleString()}
      />


      <LimitOrders
        limitOrders={limitOrders}
        activeUser={activeUser}
        setLimitOrders={setLimitOrders}
        showToast={showToast}
      />

      <SimilarCryptos similarCryptos={similarCryptos} />
      
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