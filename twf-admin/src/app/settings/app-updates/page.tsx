"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AppUpdateSetting = {
    id: number;
    latest_version: string;
    min_mandatory_version: string;
    update_link: string;
    message: string;
    is_active: boolean;
};

export default function AppUpdatesPage() {
    const [setting, setSetting] = useState<AppUpdateSetting | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('app_updates').select('*').eq('id', 1).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                setSetting(data);
            } else {
                setSetting({
                    id: 1,
                    latest_version: '1.0.0',
                    min_mandatory_version: '1.0.0',
                    update_link: '',
                    message: `A new version of the app is available! Please update your app.`,
                    is_active: false
                });
            }
        } catch (error) {
            console.error("Failed to fetch app updates settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (field: keyof AppUpdateSetting, value: any) => {
        if (setting) {
            setSetting({ ...setting, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!setting) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('app_updates').upsert({
                id: 1,
                latest_version: setting.latest_version,
                min_mandatory_version: setting.min_mandatory_version,
                update_link: setting.update_link,
                message: setting.message,
                is_active: setting.is_active,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            alert(`App Update Settings Saved!`);
        } catch (error: any) {
            console.error(error);
            alert("Error saving settings. Did you run the SQL migration?");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">App Updates</h1>
                <p className="text-slate-500 text-sm mt-1">Manage single-app versioning, trigger update prompts, and force mandatory updates.</p>
            </div>

            {!setting && !isLoading && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm font-bold border border-yellow-200">
                    ⚠️ Notice: App updates table not found. Please run the SQL command in Supabase first.
                </div>
            )}

            {setting && (
                <div className={`bg-white rounded-2xl border ${setting.is_active ? 'border-blue-400 shadow-md ring-4 ring-blue-50' : 'border-slate-200'} p-6 transition-all`}>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Global App Versioning</h3>
                            <p className="text-sm text-slate-500">Trigger update prompt for all users and vendors automatically</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={setting.is_active}
                                    onChange={(e) => handleUpdate('is_active', e.target.checked)}
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${setting.is_active ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${setting.is_active ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <span className={`ml-3 text-sm font-bold ${setting.is_active ? 'text-blue-500' : 'text-slate-500'}`}>
                                {setting.is_active ? 'Notify Users' : 'No Prompt'}
                            </span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Latest App Version</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1.0.5"
                                    value={setting.latest_version}
                                    onChange={(e) => handleUpdate('latest_version', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-700 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Min Mandatory Version</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1.0.2"
                                    value={setting.min_mandatory_version}
                                    onChange={(e) => handleUpdate('min_mandatory_version', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-700 font-bold"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Versions below this will be forced to update.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Store / Download Link</label>
                            <input
                                type="text"
                                placeholder="https://play.google.com/... or https://expo.dev/..."
                                value={setting.update_link || ''}
                                onChange={(e) => handleUpdate('update_link', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-700 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Update Message</label>
                            <textarea
                                value={setting.message || ''}
                                onChange={(e) => handleUpdate('message', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm h-24 text-slate-700 font-medium"
                                placeholder="What's new in this update?"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            Save Update Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
