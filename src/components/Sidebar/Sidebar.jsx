import { RiHome5Line, RiExchangeDollarLine, RiStockLine } from 'react-icons/ri'
import SidebarLink from './SidebarLink'

const Sidebar = () => {
  return (
    <aside className="relative w-64 h-screen bg-background border-r border-gray p-4">
      <div className="fixed mb-8">
        <h1 className="text-2xl font-bold text-primary">Binance-like</h1>
      </div>
      
      <nav className="space-y-2 fixed top-20 w-56">
        <SidebarLink to="/" icon={RiHome5Line} label="Home" />
        <SidebarLink to="/transactions" icon={RiExchangeDollarLine} label="Transactions" />
        <SidebarLink to="/market" icon={RiStockLine} label="Marché" />
      </nav>
    </aside>
  )
}

export default Sidebar
