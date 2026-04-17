import React, { useEffect, useState } from 'react';
import { mistletoeApi } from '../api/endpoints';
import type { UserSettings } from '../types';
import { Loader } from '../components/ui/Loader';
import { Settings, DollarSign, RotateCcw, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [rateInput, setRateInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mistletoeApi.getUserSettings()
            .then((data) => {
                setSettings(data);
                setRateInput(data.hourly_rate_usd !== null ? String(data.hourly_rate_usd) : '');
            })
            .catch((err: any) => setError(err.message || 'Failed to load settings'))
            .finally(() => setIsLoading(false));
    }, []);

    const effectiveRate = settings
        ? (settings.hourly_rate_usd !== null ? settings.hourly_rate_usd : settings.default_hourly_rate_usd)
        : null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSaving(true);

        let parsed = rateInput.trim() === '' ? null : parseFloat(rateInput);

        if (parsed !== null) {
            if (isNaN(parsed) || parsed > 10000) {
                setError('Hourly rate must be a valid number and at most 10,000.');
                setIsSaving(false);
                return;
            }
            if (parsed <= 0) {
                parsed = null;
            }
        }

        try {
            await mistletoeApi.updateUserSettings({ hourly_rate_usd: parsed });
            setSettings((prev) => prev ? { ...prev, hourly_rate_usd: parsed } : prev);
            setSuccessMsg('Settings saved successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        setError(null);
        setSuccessMsg(null);
        setIsSaving(true);
        try {
            await mistletoeApi.updateUserSettings({ hourly_rate_usd: null });
            setSettings((prev) => prev ? { ...prev, hourly_rate_usd: null } : prev);
            setRateInput('');
            setSuccessMsg('Hourly rate reset to system default.');
        } catch (err: any) {
            setError(err.message || 'Failed to reset settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-3">
                    <Settings className="text-accent" /> Settings
                </h1>
                <p className="text-text-muted">Manage your personal preferences for cost estimations.</p>
            </header>

            <div className="glass-card p-6 border-t-2 border-t-primary space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        <DollarSign size={18} className="text-accent" /> Hourly Rate
                    </h2>
                    <p className="text-sm text-text-muted mb-4">
                        Used to calculate cost estimates in analysis results.
                        System default is <span className="text-white font-medium">${settings?.default_hourly_rate_usd}/hr</span>.
                        {settings?.hourly_rate_usd === null && (
                            <span className="ml-1 text-text-muted">(Currently using system default)</span>
                        )}
                    </p>

                    {effectiveRate !== null && (
                        <div className="mb-4 px-4 py-2 rounded-lg bg-primary/10 text-sm text-primary font-medium inline-flex items-center gap-2">
                            <DollarSign size={14} />
                            Effective rate: ${effectiveRate}/hr
                            {settings?.hourly_rate_usd === null && <span className="text-text-muted font-normal">(default)</span>}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">
                                Custom Hourly Rate (USD)
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max="10000"
                                        step="0.01"
                                        value={rateInput}
                                        onChange={(e) => setRateInput(e.target.value)}
                                        placeholder={`${settings?.default_hourly_rate_usd} (system default)`}
                                        className="w-full bg-bg-dark border border-glass-border rounded-lg text-white pl-7 pr-4 py-2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary flex items-center gap-2 px-4"
                                >
                                    {isSaving ? <Loader size={16} /> : <Save size={16} />}
                                    Save
                                </button>
                                {settings?.hourly_rate_usd !== null && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={isSaving}
                                        title="Reset to system default"
                                        className="btn flex items-center gap-2 px-4 text-text-muted border border-glass-border hover:text-white hover:border-white/30 transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                        Reset
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-text-muted mt-1.5">
                                Leave blank to use the system default. Must be between 0.01 and 10,000.
                            </p>
                        </div>

                        {successMsg && (
                            <p className="text-sm text-green-400">{successMsg}</p>
                        )}
                        {error && (
                            <p className="text-sm text-danger">{error}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};
