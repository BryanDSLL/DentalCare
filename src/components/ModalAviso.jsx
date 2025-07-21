import PropTypes from 'prop-types';

const ModalAviso = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <div className="mb-6 text-gray-800 dark:text-gray-200">{message}</div>
          <div className="flex justify-end">
            <button onClick={onClose} className="btn btn-primary px-4 py-2 text-sm">OK</button>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalAviso.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default ModalAviso;
