import { Link, useLocation } from 'react-router-dom'

const SidebarLink = ({ to, icon, text }) => {
  const location = useLocation()
  const isActive = to === '/market' 
    ? location.pathname === to || location.pathname.startsWith('/crypto/')
    : location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-gray text-primary' 
          : 'hover:bg-gray text-white'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  )
}

export default SidebarLink
