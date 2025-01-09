import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from '../../components/Chart/Chart';
import { RiArrowRightLine, RiSendPlaneFill, RiWallet3Line, RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri';
import Modal from '../../components/Modal/Modal';

const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

const calculatePriceAtChange = (currentPrice, percentChange) => {
  const price = parseFloat(currentPrice);
  const change = parseFloat(percentChange);
  return price / (1 + change / 100);
};

const ShowCrypto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState(null);
  const [similarCryptos, setSimilarCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [isBuying, setIsBuying] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${id}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setCrypto(data[0]);
          const storedComments = JSON.parse(localStorage.getItem(`crypto-comments-${id}`)) || [];
          setComments(storedComments);
          const allCryptosResponse = await fetch('https://api.coinlore.net/api/tickers/');
          const allCryptosData = await allCryptosResponse.json();
          if (allCryptosData && allCryptosData.data) {
            const currentPrice = parseFloat(data[0].price_usd);
            const sortedCryptos = allCryptosData.data
              .filter(c => c.id !== id)
              .sort((a, b) => {
                const priceA = parseFloat(a.price_usd);
                const priceB = parseFloat(b.price_usd);
                const diffA = Math.abs(priceA - currentPrice);
                const diffB = Math.abs(priceB - currentPrice);
                return diffA - diffB;
              });

            const similar = sortedCryptos.slice(0, 5);
            setSimilarCryptos(similar);
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    setActiveUser(user);
  }, []);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      user: activeUser?.username || 'Anonymous', // Display the username of the commenter
      cryptoPrice: parseFloat(crypto.price_usd)
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleEditComment = (commentId, newText) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId ? { ...comment, text: newText } : comment
    );
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`crypto-comments-${id}`, JSON.stringify(updatedComments));
  };

  const handlePurchase = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const totalCost = amount * parseFloat(crypto.price_usd);
    if (totalCost > activeUser.cash) {
      setError('Insufficient funds');
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
  };

  const handleSale = () => {
    if (!activeUser || !crypto) return;

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const currentAmount = activeUser.cryptos[crypto.symbol] || 0;

    if (amount > currentAmount) {
      setError(`You only have ${currentAmount} ${crypto.symbol}`);
      return;
    }

    const totalValue = amount * parseFloat(crypto.price_usd);
    const updatedCash = activeUser.cash + totalValue;
    const updatedCryptos = { ...activeUser.cryptos };
    updatedCryptos[crypto.symbol] = currentAmount - amount;

    if (updatedCryptos[crypto.symbol] === 0) {
      delete updatedCryptos[crypto.symbol];
    }

    const updatedUser = {
      ...activeUser,
      cash: updatedCash,
      cryptos: updatedCryptos
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
    setSaleAmount('');
    setError(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!crypto) return <div className="p-8">No data found</div>;

  const priceChange = parseFloat(crypto.percent_change_24h);
  const chartColor = priceChange >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
          alt={crypto.name}
          className="w-16 h-16 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=64&bold=true`;
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-white">Price</p>
                <p className="text-3xl font-bold text-white">
                  ${parseFloat(crypto.price_usd).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
                <Chart data={crypto} />
              </div>
            </div>
          </div>
          {/* Comments Section */}
          <div className="bg-gray/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Comments</h3>
            <form onSubmit={handleAddComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 mb-4 rounded-lg bg-gray-800 text-white"
                rows="3"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                <RiSendPlaneFill className="inline-block mr-2" />
                Submit
              </button>
            </form>
            {comments.map((comment) => (
              <div key={comment.id} className={`mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{comment.user}</span>
                  <span className="text-sm text-gray-400">{formatDate(comment.timestamp)}</span>
                </div>
                <div className="text-white">{comment.text}</div>

                {activeUser?.username === comment.user && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        const newText = prompt('Edit your comment:', comment.text);
                        if (newText) {
                          handleEditComment(comment.id, newText);
                        }
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:underline"
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCrypto;
