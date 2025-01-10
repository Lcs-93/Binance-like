import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';

const Portfolio = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    setActiveUser(user);

    const fetchCryptoData = async () => {
      try {
        const response = await fetch('https://api.coinlore.net/api/tickers/');
        const data = await response.json();
        setCryptoData(data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Mes Actifs</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Mes Actifs</h1>
        <div>Veuillez vous connecter pour voir vos actifs</div>
      </div>
    );
  }

  const userCryptos = Object.entries(activeUser.cryptos || {})
    .map(([symbol, amount]) => {
      const cryptoInfo = cryptoData.find(crypto => 
        crypto.symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (!cryptoInfo) return null;

      return {
        id: cryptoInfo.id,
        symbol,
        name: cryptoInfo.name,
        amount,
        price: parseFloat(cryptoInfo.price_usd),
        value: amount * parseFloat(cryptoInfo.price_usd)
      };
    })
    .filter(Boolean);

  if (userCryptos.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Mes Actifs</h1>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Vous ne possédez aucune cryptomonnaie pour le moment</p>
          <Link to="/market" className="text-primary hover:text-primary/80">
            Commencer à trader
          </Link>
        </div>
      </div>
    );
  }

  const totalValue = userCryptos.reduce((total, crypto) => total + crypto.value, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mes Actifs</h1>
      
      <div className="space-y-6">
        <div className="bg-gray/20 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray text-sm text-gray-400">
            <div>Cash</div>
            <div>Devise</div>
            <div className="text-right">Montant</div>
            <div className="text-right">Prix</div>
            <div className="text-right">Valeur</div>
          </div>

          <div className="grid grid-cols-5 gap-4 p-4 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <RiMoneyDollarCircleLine size={20} className="text-primary" />
              </div>
              <span>Dollar US</span>
            </div>
            <div className="text-gray-400">USD</div>
            <div className="text-right">{activeUser.cash.toFixed(2)}</div>
            <div className="text-right">$1.00</div>
            <div className="text-right">${activeUser.cash.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-gray/20 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray text-sm text-gray-400">
            <div>Actif</div>
            <div>Symbole</div>
            <div className="text-right">Quantité</div>
            <div className="text-right">Prix</div>
            <div className="text-right">Valeur</div>
          </div>

          {userCryptos.map(crypto => (
            <Link
              key={crypto.id}
              to={`/crypto/${crypto.id}`}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray/30 transition-colors items-center"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://www.coinlore.com/img/25x25/${crypto.name.toLowerCase()}.png`}
                  alt={crypto.name}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.src = 'https://www.coinlore.com/img/25x25/bitcoin.png';
                  }}
                />
                <span>{crypto.name}</span>
              </div>
              <div className="text-gray-400">{crypto.symbol}</div>
              <div className="text-right">{crypto.amount.toFixed(6)}</div>
              <div className="text-right">${crypto.price.toFixed(2)}</div>
              <div className="text-right">${crypto.value.toFixed(2)}</div>
            </Link>
          ))}
          
          <div className="p-4 border-t border-gray bg-gray/10">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Cryptos</span>
              <span className="font-bold">
                ${totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray/20 rounded-lg overflow-hidden p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Portfolio</span>
            <span className="font-bold text-lg">
              ${(totalValue + activeUser.cash).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
