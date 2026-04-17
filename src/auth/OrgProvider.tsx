import React, { createContext, useContext, useState, useEffect } from 'react';
import { mistletoeApi } from '../api/endpoints';
import type { Organization } from '../types';

interface OrgContextType {
    organizations: Organization[];
    activeOrg: Organization | null;
    setActiveOrg: (org: Organization | null) => void;
    refreshOrgs: () => Promise<void>;
    loading: boolean;
}

const OrgContext = createContext<OrgContextType | null>(null);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshOrgs = async () => {
        try {
            const response = await mistletoeApi.getOrganizations();
            setOrganizations(response || []);
        } catch {
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshOrgs(); }, []);

    return (
        <OrgContext.Provider value={{ organizations, activeOrg, setActiveOrg, refreshOrgs, loading }}>
            {children}
        </OrgContext.Provider>
    );
};

export const useOrg = () => {
    const ctx = useContext(OrgContext);
    if (!ctx) throw new Error('useOrg must be inside OrgProvider');
    return ctx;
};
