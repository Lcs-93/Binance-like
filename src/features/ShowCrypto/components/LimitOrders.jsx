import { RiDeleteBinLine } from 'react-icons/ri';

const LimitOrders = ({ limitOrders, activeUser, setLimitOrders, showToast }) => {
  if (!limitOrders.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-white mb-4">Ordres limites</h3>
      <div className="space-y-4">
        {limitOrders
          .filter(order => order.userEmail === activeUser?.email)
          .map(order => (
            <div key={order.id} className="bg-gray/20 p-4 rounded-lg">
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
                      showToast('Ordre limite annulé', 'success');
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LimitOrders;
