'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function AboutUsFarmerPage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const { data } = await db.settings.get('vendor_about_us_content');
        if (data?.value) {
            setContent(data.value);
        } else {
            // Default template
            setContent(`
<div style="font-family: 'DM Sans', sans-serif; color: #1a1a1a;">
    <h1 style="color: #1F5E2E; margin-bottom: 16px;">About Us</h1>
    <p style="font-size: 16px; line-height: 24px; color: #4a5568;">
        Welcome to Together With Farm! We are dedicated to empowering farmers and connecting them directly with consumers. 
    </p>
    <img src="https://images.unsplash.com/photo-1595856552277-c923d3864197?w=800&auto=format&fit=crop" style="width: 100%; border-radius: 12px; margin: 24px 0;" alt="Farm scene" />
    <h2 style="color: #2D3748; margin-top: 24px;">Our Mission</h2>
    <p style="font-size: 16px; line-height: 24px; color: #4a5568;">
        To create a sustainable ecosystem where farmers thrive and consumers get the freshest produce.
    </p>
</div>
            `.trim());
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await db.settings.set('vendor_about_us_content', content);
            if (error) throw error;
            alert('About Us content updated successfully!');
        } catch (e: any) {
            console.error(e);
            alert('Failed to update content: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium mb-2 flex items-center gap-1"
                    >
                        ← Back to Settings
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">About Us for Farmers</h1>
                    <p className="text-slate-500 mt-1">Edit the content shown to farmers in the mobile app</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 ${saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95'}`}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Editor</span>
                        <span className="text-xs text-slate-400">Supports HTML & Inline CSS</span>
                    </div>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 p-4 font-mono text-sm leading-relaxed outline-none resize-none text-slate-700 bg-white"
                            placeholder="Enter HTML content here..."
                            spellCheck={false}
                        />
                    )}
                </div>

                {/* Preview Column */}
                <div className="bg-white rounded-3xl border-[8px] border-slate-900 shadow-xl overflow-hidden flex flex-col h-[600px] relative">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                        <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto absolute left-0 right-0 top-3"></div>
                        <span className="text-slate-400 text-xs font-medium">Preview</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-white overflow-y-auto">
                        <div className="p-4" dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <span className="text-amber-600 text-lg">💡</span>
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Styling Tip</h4>
                    <p className="text-amber-700 text-xs mt-1">
                        Use inline styles for best compatibility. Example: <code>&lt;h1 style="color: red;"&gt;Title&lt;/h1&gt;</code>.
                        Images should be hosted URLs.
                    </p>
                </div>
            </div>
        </div>
    );
}
