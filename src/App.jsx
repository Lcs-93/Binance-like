import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './features/Home/Home'
import Market from './features/Market/Market'
import Transactions from './features/Transactions/Transactions'
import Sidebar from './components/Sidebar/Sidebar'
import Topbar from './components/Topbar'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-white flex">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/market" element={<Market />} />
          </Routes>
        </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
