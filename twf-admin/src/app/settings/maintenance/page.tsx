"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MaintenanceSetting = {
    app_type: 'User' | 'Vendor';
    is_active: boolean;
    message: string;
    start_time: string | null;
    end_time: string | null;
};

export default function MaintenanceSettingsPage() {
    const [settings, setSettings] = useState<MaintenanceSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('maintenance_settings').select('*');
            if (error) throw error;
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch maintenance settings:", error);
            // Ignore for now, table might not exist if user didn't run SQL yet
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (appType: 'User' | 'Vendor', field: keyof MaintenanceSetting, value: any) => {
        setSettings(prev => prev.map(s => s.app_type === appType ? { ...s, [field]: value } : s));
    };

    const handleSave = async (appType: 'User' | 'Vendor') => {
        setIsSaving(true);
        try {
            const settingToSave = settings.find(s => s.app_type === appType);
            if (!settingToSave) return;

            // Upsert in case it was deleted
            const { error } = await supabase.from('maintenance_settings').upsert({
                app_type: appType,
                is_active: settingToSave.is_active,
                message: settingToSave.message,
                start_time: settingToSave.start_time || null,
                end_time: settingToSave.end_time || null,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            alert(`${appType} App Maintenance Settings Saved!`);
        } catch (error: any) {
            console.error(error);
            alert("Error saving settings. Did you run the SQL migration?");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    const renderCard = (appType: 'User' | 'Vendor') => {
        const setting = settings.find(s => s.app_type === appType) || {
            app_type: appType,
            is_active: false,
            message: `The ${appType} app is currently undergoing maintenance.`,
            start_time: '',
            end_time: ''
        };

        return (
            <div className={`bg-white rounded-2xl border ${setting.is_active ? 'border-red-400 shadow-md ring-4 ring-red-50' : 'border-slate-200'} p-6 transition-all`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{appType} App</h3>
                        <p className="text-sm text-slate-500">Control dashboard access for {appType.toLowerCase()}s</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={setting.is_active}
                                onChange={(e) => handleUpdate(appType, 'is_active', e.target.checked)}
                            />
                            <div className={`block w-14 h-8 rounded-full transition-colors ${setting.is_active ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${setting.is_active ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <span className={`ml-3 text-sm font-bold ${setting.is_active ? 'text-red-500' : 'text-slate-500'}`}>
                            {setting.is_active ? 'Maintenance ON' : 'Normal'}
                        </span>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Message Displayed</label>
                        <textarea
                            value={setting.message || ''}
                            onChange={(e) => handleUpdate(appType, 'message', e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm h-24 text-slate-700 font-medium"
                            placeholder="We'll be right back..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Start Time (Optional)</label>
                            <input
                                type="datetime-local"
                                value={setting.start_time ? new Date(setting.start_time).toISOString().slice(0, 16) : ''}
                                onChange={(e) => handleUpdate(appType, 'start_time', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">End Time (Optional)</label>
                            <input
                                type="datetime-local"
                                value={setting.end_time ? new Date(setting.end_time).toISOString().slice(0, 16) : ''}
                                onChange={(e) => handleUpdate(appType, 'end_time', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-700"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => handleSave(appType)}
                        disabled={isSaving}
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        Save {appType} Settings
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Maintenance Mode</h1>
                <p className="text-slate-500 text-sm mt-1">Restrict app access globally or for specific platforms during updates.</p>
            </div>

            {settings.length === 0 && !isLoading && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm font-bold border border-yellow-200">
                    ⚠️ Notice: It seems the maintenance table does not exist yet. Please run the SQL command in Supabase first.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCard('User')}
                {renderCard('Vendor')}
            </div>
        </div>
    );
}
