import { RiWallet3Line, RiMoneyDollarCircleLine, RiCloseLine } from 'react-icons/ri'

const RightSidebar = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-gray transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Dépôt / Retrait</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-gray/20 hover:bg-gray/30 transition-colors p-6 rounded-lg text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                <RiWallet3Line size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-lg">Dépôt depuis le portefeuille</div>
                <div className="text-sm text-gray-400">
                  Déposez des cryptos depuis votre portefeuille externe
                </div>
              </div>
            </div>
          </button>

          <button className="w-full bg-gray/20 hover:bg-gray/30 transition-colors p-6 rounded-lg text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RiMoneyDollarCircleLine size={24} className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-lg">Retrait en dollars</div>
                <div className="text-sm text-gray-400">
                  Convertissez et retirez vos cryptos en USD
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar
