import { RiCloseLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

const Modal = ({ isOpen, onClose, type = 'success', message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-gray rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          {type === 'success' ? (
            <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
              <RiCheckLine size={24} className="text-green-400" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
              <RiErrorWarningLine size={24} className="text-red-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-medium">
              {type === 'success' ? 'Succès' : 'Erreur'}
            </h3>
            <p className="text-gray-400">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
