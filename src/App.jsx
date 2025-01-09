import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Footer from './components/Footer/Footer'
import Home from './features/Home/Home'
import Market from './features/Market/Market'
import Transactions from './features/Transactions/Transactions'
import ShowCrypto from './features/ShowCrypto/ShowCrypto'
import Topbar from './components/Topbar'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-background min-h-screen text-white">
        <div className="fixed top-0 left-0 h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1">
          <div className="ml-[240px]">
            <Topbar />
          </div>
          <div className="flex-1 ml-[240px]">
            <main className="">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market" element={<Market />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/crypto/:id" element={<ShowCrypto />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App