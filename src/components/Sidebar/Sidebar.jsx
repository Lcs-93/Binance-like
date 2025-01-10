import { RiHome5Line, RiExchangeDollarLine, RiStockLine, RiWallet3Line } from 'react-icons/ri'
import SidebarLink from './SidebarLink'
import Trinance from '../../assets/Trinance.png'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-background border-r border-gray">
      <Link to="/" className="h-20 flex items-center justify-start gap-2 p-4">
        <img src={Trinance} alt="" className='w-8 h-6' />
        <h1 className="text-xl font-bold text-primary">TRINANCE</h1>
      </Link>

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
