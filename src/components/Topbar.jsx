import React, { useState, useEffect } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { RiArrowRightLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import RightSidebar from "./RightSidebar"

const REFRESH_INTERVAL = 5000;

const Topbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cryptos, setCryptos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  let timeout;

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch("https://api.coinlore.net/api/tickers/");
        const data = await response.json();
        if (data && data.data) {
          setCryptos(data.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des cryptos :", error);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    setActiveUser(user);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeout); 
    setMenuOpen(true); 
  };

  const handleMouseLeave = () => {
    timeout = setTimeout(() => {
      setMenuOpen(false); 
    }, 150); 
  };

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
    <header className="flex items-center justify-end bg-background border-b border-gray p-4 w-full">
      <div className="flex items-center space-x-3 relative">
        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center text-gray-500 hover:text-primary text-2xl"
          >
            <FiSearch />
          </button>

          {isSearchOpen && (
            <div className="absolute right-0 mt-2 bg-[#1e2329] text-white rounded-md shadow-lg py-4 w-96 max-h-96 overflow-y-auto border border-gray-700 z-50">
              <div className="px-4 pb-3 border-b border-gray-600">
                <input
                  type="text"
                  placeholder="Rechercher une crypto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-400 rounded-md focus:outline-none placeholder-gray-500"
                />
              </div>

              <div className="py-2 space-y-2">
                {filteredCryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-4 hover:bg-gray/50 transition-colors rounded-lg cursor-pointer px-8"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/crypto/${crypto.id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/${crypto.symbol.toLowerCase()}.png`}
                          alt={crypto.name}
                          className="w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=2b3139&color=fff&size=32&bold=true`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-gray-light">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                    <RiArrowRightLine size={18} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition">
          <FiDownload className="text-lg mr-2" />
          Dépôt
        </button>
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center justify-center text-gray-500 hover:text-primary text-4xl">
              <FaUserCircle />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-[#1e2329] text-white rounded-md shadow-lg py-4 w-56 border border-gray-700">
                <div className="px-4 pb-3 border-b border-gray-600">
                  <p className="text-sm font-medium">{activeUser?.email}</p>
                </div>

                <div className="py-2">
                  <a
                    href="#dashboard"
                    className="flex items-center px-4 py-2 text-sm font-semibold hover:bg-gray-700 transition"
                  >
                    <MdDashboard className="text-lg mr-3" />
                    Tableau de bord
                  </a>
                  <button
                    onClick={() => {
                      onLogout();
                      navigate('/login');
                    }}
                    className="flex items-center px-4 py-2 text-sm font-semibold hover:bg-gray-700 transition text-red-400 w-full text-left"
                  >
                    <IoLogOutOutline className="text-lg mr-3" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </header>
    <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Topbar;