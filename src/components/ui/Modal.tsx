import React from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-bg-dark border border-glass-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade">
                <div className="flex items-center justify-between p-6 border-b border-glass-border">
                    <h2 className="text-xl font-heading font-bold">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-glass rounded-full text-text-muted hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};
