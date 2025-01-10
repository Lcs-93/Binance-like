import { useEffect, useState } from "react";

const DashboardClient = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [topCryptos, setTopCryptos] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    setActiveUser(user);

    if (user && user.transactions) {
      setTransactions(user.transactions);
    }

    if (user && user.cryptos) {
      const sortedCryptos = Object.entries(user.cryptos)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 3); 
      setTopCryptos(sortedCryptos);
    }
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Informations personnelles</h1>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray/20 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Pseudo</div>
          <div className="text-xl font-medium text-white">
            {activeUser?.username || "Non défini"}
          </div>
        </div>
        <div className="bg-gray/20 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Email</div>
          <div className="text-xl font-medium text-white">
            {activeUser?.email || "Non défini"}
          </div>
        </div>
      </div>


      <h1 className="text-3xl font-bold text-white">Top 3 Cryptos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCryptos.length === 0 ? (
          <div className="text-gray-400">Aucune crypto détenue.</div>
        ) : (
          topCryptos.map(([crypto, amount], index) => (
            <div key={index} className="bg-gray/20 p-4 rounded-lg">
              <div className="text-gray-400 mb-1">Crypto</div>
              <div className="text-xl font-medium text-white">{crypto}</div>
              <div className="text-gray-400 mt-2">Montant détenu</div>
              <div className="text-lg font-bold text-white">{amount}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardClient;