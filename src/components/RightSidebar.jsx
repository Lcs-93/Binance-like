import { RiWallet3Line, RiMoneyDollarCircleLine, RiCloseLine } from 'react-icons/ri';
import { useState, useEffect, useRef } from 'react';
import Modal from './Modal/Modal';
import Toast from './Toast/Toast';

const RightSidebar = ({ isOpen, onClose }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
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
    const user = JSON.parse(localStorage.getItem('activeUser'));
    setActiveUser(user);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

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
      cash: (activeUser.cash || 0) + amount
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
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
      cash: activeUser.cash - amount
    };

    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
    setWithdrawAmount('');
    setShowWithdrawForm(false);
    showToast(`Retrait de $${amount.toFixed(2)} effectué avec succès`);
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

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
            <h2 className="text-xl font-bold">Dépôt / Retrait</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {!showDepositForm && !showWithdrawForm ? (
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
            ) : (
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
