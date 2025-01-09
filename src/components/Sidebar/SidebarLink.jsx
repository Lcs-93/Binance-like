import { Link, useLocation } from 'react-router-dom'

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-gray text-primary' 
          : 'hover:bg-gray text-white'
      }`}
    >
      <Icon className="text-xl" />
      <span>{label}</span>
    </Link>
  )
}

export default SidebarLink
