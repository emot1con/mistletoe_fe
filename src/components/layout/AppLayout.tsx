import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, PlaySquare, LogOut, Code2, Menu, X, History, Settings, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useOrg } from '../../auth/OrgProvider';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export const AppLayout: React.FC = () => {
    const { logout } = useAuth();
    const { organizations, activeOrg, setActiveOrg, refreshOrgs } = useOrg();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Repositories', path: '/repositories', icon: <GitBranch size={20} /> },
        { name: 'New Analysis', path: '/analysis/new', icon: <PlaySquare size={20} /> },
        { name: 'Analysis History', path: '/history', icon: <History size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> }
    ];

    const handleCreateOrg = async () => {
        const name = window.prompt("Enter new Organization name:");
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            // Assume mistletoeApi has createOrganization already
            const { mistletoeApi } = await import('../../api/endpoints');
            const newOrg = await mistletoeApi.createOrganization(name, slug);
            await refreshOrgs();
            setActiveOrg(newOrg);
            setIsOrgDropdownOpen(false);
        } catch (e) {
            alert("Failed to create organization");
        }
    };

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
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Code2 className="text-primary" size={24} />
                        </div>
                        <h2 className="text-2xl font-heading font-bold tracking-tight text-white">Mistletoe</h2>
                    </div>

                    {/* Org Switcher */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-glass hover:bg-glass-hover border border-glass-border transition-colors text-left"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <div className="p-1 bg-primary/10 rounded">
                                    {activeOrg ? <Building2 size={16} className="text-primary" /> : <Code2 size={16} className="text-text-muted" />}
                                </div>
                                <span className="font-medium text-sm truncate text-white">
                                    {activeOrg ? activeOrg.name : "Personal Workspace"}
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-text-muted shrink-0" />
                        </button>
                        
                        {isOrgDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 p-1 bg-bg-dark border border-glass-border rounded-lg shadow-xl z-50 animate-fade-in origin-top">
                                <button
                                    onClick={() => { setActiveOrg(null); setIsOrgDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${!activeOrg ? 'bg-primary/20 text-white' : 'text-text-muted hover:bg-glass hover:text-white'}`}
                                >
                                    <Code2 size={16} /> Personal Workspace
                                </button>
                                {organizations.length > 0 && <div className="h-px bg-glass-border my-1" />}
                                {organizations.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => { setActiveOrg(org); setIsOrgDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeOrg?.id === org.id ? 'bg-primary/20 text-white' : 'text-text-muted hover:bg-glass hover:text-white'}`}
                                    >
                                        <Building2 size={16} /> <span className="truncate">{org.name}</span>
                                    </button>
                                ))}
                                
                                {activeOrg && (
                                    <>
                                        <div className="h-px bg-glass-border my-1" />
                                        <NavLink
                                            to={`/orgs/${activeOrg.id}`}
                                            onClick={() => setIsOrgDropdownOpen(false)}
                                            className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm text-text-muted hover:bg-glass hover:text-white transition-colors"
                                        >
                                            <Settings size={14} /> Manage Workspace
                                        </NavLink>
                                    </>
                                )}

                                <div className="h-px bg-glass-border my-1" />
                                <button
                                    onClick={handleCreateOrg}
                                    className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm text-accent hover:bg-glass transition-colors font-medium border border-dashed border-glass-border mt-1"
                                >
                                    + Create Organization
                                </button>
                            </div>
                        )}
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
