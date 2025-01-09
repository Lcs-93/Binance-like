import SearchBar from "./Searchbar";
import RightSidebar from "./RightSidebar";
import { FiDownload } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const navigate = useNavigate();
  let timeout;

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

  return (
    <>
      <header className="flex items-center justify-between bg-background border-b border-gray p-4 w-full">
        <div className="flex items-center space-x-4">
          <SearchBar />
        </div>

        <div className="flex items-center space-x-3 relative">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
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