
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings - TWF Admin',
    description: 'Manage application settings',
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure application settings and legal documents.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href="/settings/policies"
                    className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 ring-2 ring-transparent hover:ring-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        ⚖️
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">Legal Policies</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Manage Terms & Conditions, Privacy Policy, and other legal documents displayed in the app.
                    </p>
                    <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        Configure Now <span className="ml-1">→</span>
                    </div>
                </Link>

                {/* Placeholder for future settings */}
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 border-dashed flex flex-col items-center justify-center text-center group cursor-not-allowed">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center text-2xl mb-4 group-hover:bg-slate-200/50 transition-colors">
                        🔧
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-2">General Settings</h3>
                    <p className="text-slate-400 text-sm">Create configurations coming soon.</p>
                </div>
            </div>
        </div>
    );
}
