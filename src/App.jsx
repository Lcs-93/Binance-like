import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './features/Login/Login';
import Signup from './features/Signup/Signup';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import Home from './features/Home/Home';
import Market from './features/Market/Market';
import Transactions from './features/Transactions/Transactions';
import ShowCrypto from './features/ShowCrypto/ShowCrypto';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('user') // Vérifie si un utilisateur est connecté
  );

  return (
    <BrowserRouter>
      <div className="flex bg-background min-h-screen text-white">
        {isAuthenticated && (
          <div className="fixed top-0 left-0 h-full">
            <Sidebar />
          </div>
        )}
        <div className={`flex-1 ${isAuthenticated ? 'ml-[240px]' : 'flex items-center justify-center'}`}>
          <main className="">
            <Routes>
              {/* Page de Connexion */}
              <Route
                path="/"
                element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />}
              />
              
              {/* Page d'Inscription */}
              <Route
                path="/signup"
                element={<Signup onSignupSuccess={() => setIsAuthenticated(true)} />}
              />

              {/* Pages principales uniquement accessibles après authentification */}
              {isAuthenticated && (
                <>
                  <Route path="/home" element={<Home />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/crypto/:id" element={<ShowCrypto />} />
                </>
              )}
            </Routes>
          </main>
          {isAuthenticated && <Footer />}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
