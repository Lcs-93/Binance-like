import { RiWallet3Line, RiMoneyDollarCircleLine, RiCloseLine, RiExchangeLine } from 'react-icons/ri';
import { useState, useEffect, useRef } from 'react';
import Toast from './Toast/Toast';
import { addTransaction, addTransactionForUser } from '../utils/transactionUtils';

const RightSidebar = ({ isOpen, onClose }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeData, setExchangeData] = useState({
    recipient: '',
    cryptoId: '',
    amount: ''
  });
  const [userCryptos, setUserCryptos] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const loadUserData = () => {
      const user = JSON.parse(localStorage.getItem('activeUser'));
      setActiveUser(user);
      
      if (user) {
        const userCryptos = Object.entries(user.cryptos || {})
          .filter(([_, amount]) => amount > 0)
          .map(([symbol, amount]) => ({
            id: symbol,
            name: symbol,
            amount
          }));
        
        setUserCryptos(userCryptos);
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        setAllUsers(users.filter(u => u.email !== user.email));
      }
    };

    loadUserData();

    window.addEventListener('transactionUpdated', loadUserData);
    window.addEventListener('assetsUpdated', loadUserData);

    return () => {
      window.removeEventListener('transactionUpdated', loadUserData);
      window.removeEventListener('assetsUpdated', loadUserData);
    };
  }, []);

  const handleDeposit = () => {
    if (!depositAmount || !activeUser) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      showToast('Le montant doit être supérieur à 0', 'error');
      return;
    }

    const updatedUser = {
      ...activeUser,
      cash: (activeUser.cash || 0) + amount,
      lastUpdate: Date.now()
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);

    addTransaction({
      type: 'deposit',
      amount: amount,
      total: amount,
      status: 'completed'
    });

    setDepositAmount('');
    setShowDepositForm(false);
    showToast(`Dépôt de $${amount.toFixed(2)} effectué avec succès`);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !activeUser) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0) {
      showToast('Le montant doit être supérieur à 0', 'error');
      return;
    }

    if (amount > activeUser.cash) {
      showToast('Fonds insuffisants pour ce retrait', 'error');
      return;
    }

    const updatedUser = {
      ...activeUser,
      cash: activeUser.cash - amount,
      lastUpdate: Date.now()
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);

    addTransaction({
      type: 'withdrawal',
      amount: amount,
      total: amount,
      status: 'completed'
    });

    setWithdrawAmount('');
    setShowWithdrawForm(false);
    showToast(`Retrait de $${amount.toFixed(2)} effectué avec succès`);
  };

  const handleExternalExchange = () => {
    if (!exchangeData.recipient || !exchangeData.cryptoId || !exchangeData.amount) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    const amount = parseFloat(exchangeData.amount);
    if (amount <= 0) {
      showToast('Le montant doit être supérieur à 0', 'error');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const recipient = users.find(u => u.email === exchangeData.recipient);
    if (!recipient) {
      showToast("L'utilisateur destinataire n'existe pas", 'error');
      return;
    }

    const senderCryptos = activeUser.cryptos || {};
    if (!senderCryptos[exchangeData.cryptoId] || senderCryptos[exchangeData.cryptoId] < amount) {
      showToast('Fonds insuffisants pour cet échange', 'error');
      return;
    }

    const updatedSenderCryptos = { ...senderCryptos };
    updatedSenderCryptos[exchangeData.cryptoId] -= amount;
    
    const recipientUser = JSON.parse(localStorage.getItem(`user-${recipient.email}`)) || recipient;
    const recipientCryptos = recipientUser.cryptos || {};
    recipientCryptos[exchangeData.cryptoId] = (recipientCryptos[exchangeData.cryptoId] || 0) + amount;

    const updatedActiveUser = {
      ...activeUser,
      cryptos: updatedSenderCryptos
    };
    const updatedRecipient = {
      ...recipientUser,
      cryptos: recipientCryptos
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedActiveUser));
    localStorage.setItem(`user-${recipient.email}`, JSON.stringify(updatedRecipient));
    
    const updatedUsers = users.map(u => 
      u.email === recipient.email ? updatedRecipient : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    window.dispatchEvent(new Event('assetsUpdated'));
    
    addTransaction({
      type: 'external_exchange_sent',
      cryptoId: exchangeData.cryptoId,
      cryptoName: exchangeData.cryptoId,
      amount: amount,
      recipient: exchangeData.recipient,
      total: amount,
      status: 'completed'
    });

    addTransactionForUser({
      type: 'external_exchange_received',
      cryptoId: exchangeData.cryptoId,
      cryptoName: exchangeData.cryptoId,
      amount: amount,
      sender: activeUser.email,
      total: amount,
      status: 'completed'
    }, recipient.email);

    setActiveUser(updatedActiveUser);
    setUserCryptos(Object.entries(updatedSenderCryptos)
      .filter(([_, amount]) => amount > 0)
      .map(([symbol, amount]) => ({
        id: symbol,
        name: symbol,
        amount
      }))
    );
    setExchangeData({ recipient: '', cryptoId: '', amount: '' });
    showToast('Échange effectué avec succès');
    
    setTimeout(() => {
      setShowExchangeForm(false);
    }, 5000);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  console.log(userCryptos);

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-gray transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        ref={sidebarRef}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Dépôt / Retrait / Échange</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {!showDepositForm && !showWithdrawForm && !showExchangeForm ? (
              <>
                <button
                  onClick={() => setShowDepositForm(true)}
                  className="w-full bg-gray/20 hover:bg-gray/30 transition-colors p-6 rounded-lg text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <RiWallet3Line size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Dépôt d'argent</div>
                      <div className="text-sm text-gray-400">
                        Déposez de l'argent sur votre compte
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowWithdrawForm(true)}
                  className="w-full bg-gray/20 hover:bg-gray/30 transition-colors p-6 rounded-lg text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <RiMoneyDollarCircleLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Retrait en dollars</div>
                      <div className="text-sm text-gray-400">
                        Retirez de l'argent de votre compte
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowExchangeForm(true)}
                  className="w-full bg-gray/20 hover:bg-gray/30 transition-colors p-6 rounded-lg text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <RiExchangeLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Échange externe</div>
                      <div className="text-sm text-gray-400">
                        Envoyez des cryptos à un autre utilisateur
                      </div>
                    </div>
                  </div>
                </button>

                {activeUser && (
                  <div className="mt-8 p-4 bg-gray/20 rounded-lg">
                    <p className="text-sm text-gray-400">Votre cash disponible</p>
                    <p className="text-xl font-bold">${activeUser.cash || 0}</p>
                  </div>
                )}
              </>
            ) : showDepositForm ? (
              <div className="bg-gray/20 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Dépôt d'argent</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Montant en dollars</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 rounded bg-background border border-gray-600 text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    className="flex-1 bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Déposer
                  </button>
                  <button
                    onClick={() => {
                      setShowDepositForm(false);
                      setDepositAmount('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : showWithdrawForm ? (
              <div className="bg-gray/20 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Retrait d'argent</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Montant en dollars</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ${activeUser?.cash || 0}`}
                    className="w-full p-2 rounded bg-background border border-gray-600 text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (activeUser?.cash || 0)}
                    className="flex-1 bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retirer
                  </button>
                  <button
                    onClick={() => {
                      setShowWithdrawForm(false);
                      setWithdrawAmount('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray/20 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Échange externe</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Destinataire</label>
                    <select
                      value={exchangeData.recipient}
                      onChange={(e) => setExchangeData({ ...exchangeData, recipient: e.target.value })}
                      className="w-full p-2 rounded bg-background border border-gray-600 text-white"
                    >
                      <option value="">Sélectionnez un destinataire</option>
                      {allUsers.map(user => (
                        <option key={user.email} value={user.email}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Crypto à envoyer</label>
                    <select
                      value={exchangeData.cryptoId}
                      onChange={(e) => setExchangeData({ ...exchangeData, cryptoId: e.target.value })}
                      className="w-full p-2 rounded bg-background border border-gray-600 text-white"
                    >
                      <option value="">Sélectionnez une crypto</option>
                      {userCryptos.map(crypto => (
                        <option key={crypto.id} value={crypto.id}>
                          {crypto.name} ({crypto.amount.toFixed(6)} disponible)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Montant à envoyer</label>
                    <input
                      type="number"
                      value={exchangeData.amount}
                      onChange={(e) => setExchangeData({ ...exchangeData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full p-2 rounded bg-background border border-gray-600 text-white"
                      max={userCryptos.find(c => c.id === exchangeData.cryptoId)?.amount || 0}
                      step="0.000001"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleExternalExchange}
                      disabled={!exchangeData.recipient || !exchangeData.cryptoId || !exchangeData.amount || parseFloat(exchangeData.amount) <= 0}
                      className="flex-1 bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => {
                        setShowExchangeForm(false);
                        setExchangeData({ recipient: '', cryptoId: '', amount: '' });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </>
  );
};

export default RightSidebar;
