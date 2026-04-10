import React, { useState, useRef } from 'react';
import { AlertTriangle, ChevronDown, Clock, Server, Sparkles, Shield, Zap, Link as LinkIcon, Briefcase } from 'lucide-react';

const securitySeverityLabel: Record<string, string> = {
    low: 'Minor concern — does not significantly affect system security.',
    medium: 'Moderate concern — should be reviewed before production deploy.',
    high: 'High concern — requires thorough security review and testing.',
    critical: 'Critical concern — MUST pass security audit before any deploy.',
};

const performanceDescription: Record<string, string> = {
    low: 'Low performance impact — does not significantly affect system speed or resources.',
    medium: 'Moderate performance impact — may slow down some operations if not properly optimized.',
    high: 'High performance impact — likely to cause noticeable slowdowns, requires optimization or scaling.',
    critical: 'Critical performance impact — will severely affect system performance, requires load testing before deploy.',
};

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
            {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : level === 'high' ? 'High' : 'Critical'} Risk
        </span>
    );
};

export const AlternativeApproaches: React.FC<{ approaches: any[] }> = ({ approaches }) => {
    const [selectedIdx, setSelectedIdx] = useState(() => {
        const mvpIdx = approaches?.findIndex(app => (app.label || '').toLowerCase().includes('mvp'));
        return mvpIdx >= 0 ? mvpIdx : 0;
    });
    const [isOpen, setIsOpen] = useState(false);

    if (!approaches || approaches.length === 0) return null;

    const selected = approaches[selectedIdx];
    const maxHoursAll = Math.max(...approaches.map(a => a.estimated_effort_max_hours));
    const minHours = selected.estimated_effort_min_hours;
    const maxHours = selected.estimated_effort_max_hours;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    const minDash = (minHours / maxHoursAll) * circumference;
    const maxDash = ((maxHours - minHours) / maxHoursAll) * circumference;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" /> Strategy Alternatives
                </h3>
            </div>
            
            <div className="glass-card p-6 border-t-4 border-t-accent/50 relative">
                {/* Dropdown Header */}
                <div className="flex justify-between items-center mb-6 border-b border-glass-border pb-4 relative">
                    <div className="relative">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-bg-dark border border-glass-border rounded-lg hover:border-accent transition-all text-left"
                        >
                            <div>
                                <span className="text-xs text-text-muted block uppercase font-bold tracking-wider">Selected Tier</span>
                                <span className="text-lg font-heading font-bold text-accent">{selected.label}</span>
                            </div>
                            <ChevronDown size={20} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-glass border border-glass-border rounded-lg shadow-xl z-10 overflow-hidden backdrop-blur-md">
                                {approaches.map((app, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedIdx(idx);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-glass-border transition-colors border-l-2 ${idx === selectedIdx ? 'border-l-accent bg-glass-border/50' : 'border-l-transparent'}`}
                                    >
                                        <div className="font-bold text-sm text-text-main">{app.label}</div>
                                        <div className="text-xs text-text-muted">{app.estimated_effort_min_hours} - {app.estimated_effort_max_hours} hrs</div>
                                        <div className="text-xs font-mono text-accent mt-0.5">${app.cost_estimate_min_usd} - ${app.cost_estimate_max_usd}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <RiskBadge level={selected.impact_level} />
                </div>
                
                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left content: info */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                        <div className="mb-6 space-y-2">
                            <p className="text-lg font-semibold text-text-main">
                                {selected.description}
                            </p>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {(() => {
                                    const lower = (selected.label || '').toLowerCase();
                                    if (lower.includes('mvp')) {
                                        return "MVP (Minimum Viable Product) focuses ONLY on the core functionalities needed to validate the feature. It delivers the highest priority capabilities with minimal effort, suitable for testing hypotheses quickly.";
                                    } else if (lower.includes('balanced')) {
                                        return "The Balanced approach includes the core MVP features plus important secondary functionalities. It provides a solid user experience with a reasonable development timeline, making it the most recommended option for standard releases.";
                                    } else if (lower.includes('comprehensive')) {
                                        return "The Comprehensive tier includes every nice-to-have, advanced, and edge-case capability. This is the full-featured vision that prioritizes maximum utility over launch speed.";
                                    }
                                    return "This strategy presents a tailored combination of features based on the selected priority.";
                                })()}
                            </p>
                        </div>
                        
                        <div className="mt-auto">
                            <p className="text-xs uppercase font-bold text-text-muted mb-2">Included Patterns / Features:</p>
                            <div className="flex flex-wrap gap-2">
                                {selected.included_patterns.map((p: string) => (
                                    <span key={p} className="px-2 py-1 bg-bg-dark border border-glass-border rounded-md text-xs text-text-main shadow-sm font-mono">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right content: Pie Chart */}
                    <div className="flex flex-col items-center justify-center bg-bg-dark/50 p-4 rounded-xl border border-glass-border">
                        <p className="text-xs font-bold uppercase text-text-muted mb-4 tracking-wider">Effort Breakdown</p>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Base unfilled ring */}
                                <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" className="text-glass-border" strokeWidth="12" />
                                
                                {/* Min hours ring */}
                                <circle 
                                    cx="50" cy="50" r={radius} fill="none" 
                                    stroke="var(--primary)" 
                                    strokeWidth="12" 
                                    strokeDasharray={`${minDash} ${circumference}`}
                                    strokeDashoffset="0"
                                    className="transition-all duration-700 ease-in-out"
                                />
                                
                                {/* Buffer hours ring (max - min) */}
                                <circle 
                                    cx="50" cy="50" r={radius} fill="none" 
                                    stroke="var(--accent)" 
                                    strokeWidth="12" 
                                    strokeDasharray={`${maxDash} ${circumference}`}
                                    strokeDashoffset={`-${minDash}`}
                                    className="transition-all duration-700 ease-in-out opacity-80"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="font-heading font-bold text-lg text-text-main">{minHours}-{maxHours}</span>
                                <span className="text-[10px] text-text-muted uppercase">Hours</span>
                            </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-col gap-2 mt-4 w-full px-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                                    <span className="text-text-muted">Minimum Effort</span>
                                </div>
                                <span className="font-mono">{minHours}h</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
                                    <span className="text-text-muted">Max Buffer</span>
                                </div>
                                <span className="font-mono">+{maxHours - minHours}h</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border">
                                <span className="text-xs font-bold text-text-muted uppercase">Estimated Cost</span>
                                <span className="text-xs font-mono font-bold text-accent">${selected.cost_estimate_min_usd} - ${selected.cost_estimate_max_usd}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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

export const DecisionFactors: React.FC<{ result: any }> = ({ result }) => {
    const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (factor: string) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredFactor(factor);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setHoveredFactor(null);
    };
    
    // Safely verify if arrays exist and have items
    const hasSecurityFlags = Array.isArray(result.security_flags) && result.security_flags.length > 0;
    const hasExternalDeps = Array.isArray(result.external_dependencies) && result.external_dependencies.length > 0;

    return (
        <div className="mt-8 space-y-4">
            <h4 className="text-sm font-bold text-text-muted uppercase">Decision Factors</h4>
            
            <div className="flex flex-wrap gap-3">
                {/* Security Badge */}
                {result.security_impact !== 'none' && (
                    <div 
                        className="relative flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-semibold cursor-pointer transition-all hover:bg-danger/20"
                        onMouseEnter={() => handleMouseEnter('security')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Shield size={16} /> Security: {result.security_impact}
                        {hoveredFactor === 'security' && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-bg-dark border border-glass-border rounded-xl shadow-xl z-20 min-w-[280px] animate-fade">
                                <h5 className="text-xs font-bold text-text-muted uppercase mb-2 flex items-center gap-2">
                                    <Shield size={14} className="text-danger" /> Security Detail
                                </h5>
                                <p className="text-sm text-text-main mb-3">
                                    {securitySeverityLabel[result.security_impact] || 'No security concerns detected.'}
                                </p>
                                {hasSecurityFlags && (
                                    <ul className="list-disc list-inside text-sm text-text-main space-y-1 border-t border-glass-border pt-2">
                                        {result.security_flags.map((flag: string, i: number) => (
                                            <li key={i}>{flag}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Performance Badge */}
                {result.performance_impact !== 'none' && (
                    <div 
                        className="relative flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm font-semibold cursor-pointer transition-all hover:bg-yellow-500/20"
                        onMouseEnter={() => handleMouseEnter('performance')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Zap size={16} /> Perf: {result.performance_impact}
                        {hoveredFactor === 'performance' && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-bg-dark border border-glass-border rounded-xl shadow-xl z-20 min-w-[280px] animate-fade">
                                <h5 className="text-xs font-bold text-text-muted uppercase mb-2 flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-500" /> Performance Detail
                                </h5>
                                <p className="text-sm text-text-main">
                                    {performanceDescription[result.performance_impact] || 'No significant performance impact.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* External Deps Badge */}
                {result.external_dependency_count > 0 && (
                    <div 
                        className="relative flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-semibold cursor-pointer transition-all hover:bg-blue-500/20"
                        onMouseEnter={() => handleMouseEnter('extdeps')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <LinkIcon size={16} /> Ext Deps: {result.external_dependency_count}
                        {hoveredFactor === 'extdeps' && hasExternalDeps && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-bg-dark border border-glass-border rounded-xl shadow-xl z-20 min-w-[280px] animate-fade">
                                <h5 className="text-xs font-bold text-text-muted uppercase mb-2 flex items-center gap-2">
                                    <LinkIcon size={14} className="text-blue-500" /> External Dependencies
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {result.external_dependencies.map((dep: string) => (
                                        <span key={dep} className="px-2 py-1 bg-glass border border-glass-border/50 rounded-md text-xs font-mono text-text-main">
                                            {dep}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Technical Debt Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-semibold">
                    <Briefcase size={16} /> Debt: {result.technical_debt_score}
                </div>
            </div>
        </div>
    );
};
