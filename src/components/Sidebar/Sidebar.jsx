import { RiHome5Line, RiExchangeDollarLine, RiStockLine, RiWallet3Line } from 'react-icons/ri'
import SidebarLink from './SidebarLink'

const Sidebar = () => {
  return (
    <aside className="w-56 h-screen bg-background border-r border-gray">
      <div className="h-20"></div>
      
      <nav className="space-y-2 fixed top-20 w-56">
        <SidebarLink 
          to="/home" 
          icon={<RiHome5Line className="text-xl" />} 
          text="Accueil" 
        />

        <SidebarLink 
          to="/market" 
          icon={<RiStockLine className="text-xl" />} 
          text="Marché" 
        />

        <SidebarLink 
          to="/actifs" 
          icon={<RiWallet3Line className="text-xl" />} 
          text="Actifs" 
        />

        <SidebarLink 
          to="/transactions" 
          icon={<RiExchangeDollarLine className="text-xl" />} 
          text="Transactions" 
        />
      </nav>
    </aside>
  )
}

export default Sidebar
