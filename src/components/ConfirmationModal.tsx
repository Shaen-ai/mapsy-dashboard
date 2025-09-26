import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600 bg-red-100',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600 bg-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          icon: 'text-blue-600 bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      default:
        return {
          icon: 'text-red-600 bg-red-100',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start">
            <div className={`p-3 rounded-full ${colors.icon} flex-shrink-0`}>
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;