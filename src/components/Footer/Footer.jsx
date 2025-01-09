import { RiTwitterXLine, RiDiscordLine, RiTelegramLine, RiGithubLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: RiTwitterXLine, label: 'Twitter' },
    { icon: RiDiscordLine, label: 'Discord' },
    { icon: RiTelegramLine, label: 'Telegram' },
    { icon: RiGithubLine, label: 'GitHub' }
  ]

  return (
    <footer className="border-t border-gray mt-12">
      <div className="max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-primary font-bold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Carrières
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Presse
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Frais
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Sécurité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                  Conformité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold mb-4">Communauté</h3>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href={''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Trinance. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                Préférences
              </Link>
              <Link to="/#" className="text-gray-400 hover:text-white transition-colors">
                Plan du site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
