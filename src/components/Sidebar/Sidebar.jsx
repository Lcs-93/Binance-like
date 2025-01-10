import { RiHome5Line, RiExchangeDollarLine, RiStockLine, RiWallet3Line } from 'react-icons/ri'
import SidebarLink from './SidebarLink'
import Trinance from '../../assets/Trinance.png'

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-background border-r border-gray">
      <div className="h-20 flex items-center justify-start gap-2 p-4">
        <img src={Trinance} alt="" className='w-8 h-6' />
      <h1 className="text-2xl font-bold text-primary">Trinance</h1>
      </div>

      <nav className="space-y-2 fixed top-20 w-56 m-4">
        <SidebarLink
          to="/home"
          icon={<RiHome5Line className="text-xl" />}
          text="Accueil"
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

        <SidebarLink
          to="/market"
          icon={<RiStockLine className="text-xl" />}
          text="Marché"
        />

        <SidebarLink
          to="/exchanges"
          icon={<RiExchangeDollarLine className="text-xl" />}
          text="Echanges"
        />

      </nav>
    </aside>
  )
}

export default Sidebar
