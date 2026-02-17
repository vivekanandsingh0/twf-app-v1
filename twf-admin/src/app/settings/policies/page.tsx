
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

type Policy = {
    id: string;
    slug: 'terms-conditions' | 'privacy-policy' | 'privacy-security';
    title: string;
    content: string;
    updated_at: string;
};

const POLICY_TYPES = [
    { slug: 'terms-conditions', label: 'Terms & Conditions' },
    { slug: 'privacy-policy', label: 'Privacy Policy' },
    { slug: 'privacy-security', label: 'Privacy & Security' },
];

export default function PoliciesPage() {
    const [activeSlug, setActiveSlug] = useState<string>('terms-conditions');
    const [policies, setPolicies] = useState<Record<string, Policy>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');

    // Fetch policies on mount
    useEffect(() => {
        fetchPolicies();
    }, []);

    // Update content when active tab changes
    useEffect(() => {
        if (policies[activeSlug]) {
            setContent(policies[activeSlug].content || '');
        } else {
            setContent('');
        }
    }, [activeSlug, policies]);

    const fetchPolicies = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('app_policies')
            .select('*');

        if (error) {
            console.error('Error fetching policies:', error);
            alert('Failed to load policies. ' + error.message);
            // Add debug info if table doesn't exist
            if (error.code === '42P01') {
                // relation does not exist
                alert('Hint: Ensure you ran the SQL migration to create "app_policies" table.');
            }
        } else {
            const mapped: Record<string, Policy> = {};
            data?.forEach((p: any) => {
                mapped[p.slug] = p;
            });
            setPolicies(mapped);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);

        // Find if existing
        const existing = policies[activeSlug];

        const payload = {
            slug: activeSlug,
            title: POLICY_TYPES.find(p => p.slug === activeSlug)?.label || 'Policy',
            content: content,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (existing) {
            // Update
            result = await supabase
                .from('app_policies')
                .update(payload)
                .eq('slug', activeSlug)
                .select();
        } else {
            // Insert
            result = await supabase
                .from('app_policies')
                .insert([payload])
                .select();
        }

        if (result.error) {
            alert('Error saving: ' + result.error.message);
        } else {
            // Check if data was actually returned. If RLS blocks update, error might be null but data empty.
            if (!result.data || result.data.length === 0) {
                alert('Error: Saved successfully locally but database rejected the update. This is likely a permission issue. Please ensuring you ran the migration scripts.');
            } else {
                alert('Saved successfully!');
                // Update local state
                if (result.data && result.data[0]) {
                    setPolicies(prev => ({ ...prev, [activeSlug]: result.data[0] }));
                }
            }
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Legal Policies</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage the content for your app's legal pages. Supports rich text formatting.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className={`
            px-6 py-2 rounded-xl text-white font-bold transition-all shadow-lg shadow-emerald-200
            ${saving ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95'}
          `}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                {POLICY_TYPES.map((type) => (
                    <button
                        key={type.slug}
                        onClick={() => setActiveSlug(type.slug)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeSlug === type.slug
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
            `}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
                        Loading editor...
                    </div>
                ) : (
                    <RichTextEditor
                        label="Page Content"
                        value={content}
                        onChange={setContent}
                        placeholder="Enter the policy details here..."
                    // Using key to force re-render when switching tabs if needed, 
                    // but controlled input should handle it. 
                    // Actually, rich text editor often needs key change if internal ref isn't updated well.
                    // Let's rely on useEffect inside Editor.
                    />
                )}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Changes made here reflect immediately in the user app.
                    Use the formatting toolbar to add headers, bold text, and lists.
                </p>
            </div>
        </div>
    );
}
