import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, PlaySquare, LogOut, Code2, Menu, X, History, Settings } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export const AppLayout: React.FC = () => {
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Repositories', path: '/repositories', icon: <GitBranch size={20} /> },
        { name: 'New Analysis', path: '/analysis/new', icon: <PlaySquare size={20} /> },
        { name: 'Analysis History', path: '/history', icon: <History size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> }
    ];

    return (
        <div className="flex h-screen bg-bg-dark overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30
                w-[var(--sidebar-width)]
                glass-card !border-y-0 !border-l-0 !rounded-none
                flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Code2 className="text-primary" size={24} />
                        </div>
                        <h2 className="text-2xl font-heading font-bold tracking-tight text-white">Mistletoe</h2>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${isActive 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'text-text-muted hover:bg-glass hover:text-white'}
                            `}
                        >
                            {link.icon}
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-glass-border">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-danger/10 hover:text-danger transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden h-[var(--header-height)] glass-card !border-x-0 !border-t-0 !border-b !rounded-none flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <Code2 className="text-primary" size={20} />
                        <span className="font-heading font-bold">Mistletoe</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-text-muted">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto w-full animate-fade">
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
};
