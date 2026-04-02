import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
);

export const PageLoader: React.FC = () => (
    <div className="flex h-64 items-center justify-center">
        <Loader size={40} />
    </div>
);
