import React from 'react';
import { AlertTriangle, Clock, Server } from 'lucide-react';

export const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
    const colors = {
        low: 'bg-success/20 text-success border-success/30',
        medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        high: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
        critical: 'bg-danger/20 text-danger border-danger/30'
    };
    
    const colorClass = colors[level as keyof typeof colors] || colors.low;
    
    return (
        <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider flex items-center w-fit gap-1.5 ${colorClass}`}>
            <AlertTriangle size={14} />
            {level} Risk
        </span>
    );
};

export const ImpactScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = Math.min(100, Math.max(0, (score / 10) * 100));
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-glass-border" strokeWidth="8" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke="url(#impactGradient)" 
                        strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * percentage / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="impactGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute text-center">
                    <span className="text-4xl font-heading font-bold text-gradient">{score}</span>
                    <span className="text-text-muted text-sm block">/ 10</span>
                </div>
            </div>
            <p className="mt-4 font-semibold text-text-muted">Impact Score</p>
        </div>
    );
};

export const EffortRange: React.FC<{ min: number; max: number }> = ({ min, max }) => (
    <div className="flex items-center gap-3 bg-glass p-4 rounded-xl border border-glass-border">
        <div className="p-2 bg-accent/20 text-accent rounded-lg">
            <Clock size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-text-muted">Estimated Effort</p>
            <p className="text-xl font-heading font-bold">{min} - {max} <span className="text-sm font-normal text-text-muted">Hours</span></p>
        </div>
    </div>
);

export const ComponentsList: React.FC<{ components: string[] }> = ({ components }) => (
    <div className="bg-glass p-4 rounded-xl border border-glass-border">
        <div className="flex items-center gap-2 mb-3 text-text-muted font-medium text-sm">
            <Server size={16} /> Affected Components
        </div>
        <div className="flex flex-wrap gap-2">
            {components.length === 0 ? (
                <span className="text-xs text-text-muted italic">No specific components detected</span>
            ) : (
                components.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-bg-dark border border-glass-border rounded-lg text-sm text-text-main shadow-sm font-mono">
                        {c}
                    </span>
                ))
            )}
        </div>
    </div>
);
