import { RiDeleteBinLine, RiSearchLine } from 'react-icons/ri';
import { useState } from 'react';

const LimitOrders = ({ limitOrders, activeUser, setLimitOrders, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = limitOrders
    .filter(order => order.userEmail === activeUser?.email)
    .filter(order => 
      order.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-xl font-medium text-white">Limit Orders</div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by symbol..."
            className="w-full bg-gray/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-light" />
        </div>
      </div>

      <div className="space-y-2">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg px-8"
          >
            <div className="flex items-center gap-8">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${order.symbol.toLowerCase()}.png`}
                  alt={order.symbol}
                  className="w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${order.symbol}&background=2b3139&color=fff&size=32&bold=true`;
                  }}
                />
              </div>
              <div>
                <div className="font-medium text-white">{order.symbol}</div>
                <div className="text-sm text-gray-light">Limit Order</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  {order.amount} {order.symbol}
                </div>
                <div className="text-sm text-gray-light">
                  ${order.limitPrice}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right w-32">
                <div className="text-white font-medium">
                  ${order.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Total Cost</div>
              </div>
              <div className="text-right w-48">
                <div className="text-white font-medium">
                  {new Date(order.expiryDate).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Expiry Date</div>
              </div>
              <div className="text-right w-24">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
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
                  className="text-red-400 hover:text-red-300 ml-4"
                >
                  <RiDeleteBinLine size={20} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-gray-light text-center py-8">
            No limit orders found
          </div>
        )}
      </div>
    </div>
  );
};

export default LimitOrders;
