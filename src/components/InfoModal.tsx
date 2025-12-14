import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-surface w-full max-w-sm p-6 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {type === 'SUCCESS' ? (
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          )}
          <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">{title}</h2>
          <p className="text-text-secondary mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
