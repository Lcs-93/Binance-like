import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './features/Login/Login';
import Signup from './features/Signup/Signup';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import Home from './features/Home/Home';
import Market from './features/Market/Market';
import Transactions from './features/Transactions/Transactions';
import Exchange from './features/Exchange/Exchange';
import ShowCrypto from './features/ShowCrypto/ShowCrypto';
import Topbar from './components/Topbar';
import DashboardClient from './components/DashboardClient/DashboardClient';
import Portfolio from './features/Portfolio/Portfolio';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('activeUser')
  );

  return (
    <BrowserRouter>
      <div className="flex bg-background min-h-screen text-white">
        {isAuthenticated && (
          <div className="fixed top-0 left-0 h-full">
            <Sidebar />
          </div>
        )}

        <div className={`flex flex-col flex-1 ${isAuthenticated ? 'ml-[250px]' : ''}`}>
          {isAuthenticated && <Topbar onLogout={() => setIsAuthenticated(false)} />}
          <main className={isAuthenticated ? '' : 'flex items-center justify-center h-screen'}>
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                  )
                }
              />

              <Route
                path="/signup"
                element={
                  isAuthenticated ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Signup onSignupSuccess={() => setIsAuthenticated(true)} />
                  )
                }
              />

              {isAuthenticated ? (
                <>
                  <Route path="/home" element={<Home />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/exchanges" element={<Exchange />} />
                  <Route path="/crypto/:id" element={<ShowCrypto />} />
                  <Route path="/dashboard" element={<DashboardClient />} />
                  <Route path="/actifs" element={<Portfolio />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/" element={<Navigate to="/home" replace />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" replace />} />
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