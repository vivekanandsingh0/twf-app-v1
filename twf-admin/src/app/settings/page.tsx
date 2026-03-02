
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

                {/* About Us for Farmers */}
                <Link
                    href="/settings/about-us-farmer"
                    className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 ring-2 ring-transparent hover:ring-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        👨‍🌾
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-700 transition-colors">About Us (Farmers)</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Customize the "About Us" page content seen by farmers and vendors in the mobile app.
                    </p>
                    <div className="mt-4 flex items-center text-orange-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        Edit Content <span className="ml-1">→</span>
                    </div>
                </Link>

                {/* Delivery Charges */}
                <Link
                    href="/settings/delivery"
                    className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 ring-2 ring-transparent hover:ring-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        🚚
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">Delivery Charges</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Set minimum order amount for free delivery and delivery fee for smaller orders.
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        Configure Now <span className="ml-1">→</span>
                    </div>
                </Link>

                {/* Maintenance Mode */}
                <Link
                    href="/settings/maintenance"
                    className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 ring-2 ring-transparent hover:ring-red-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        🚧
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-red-700 transition-colors">Maintenance Mode</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Temporarily restrict access to User or Vendor dashboards while updating systems.
                    </p>
                    <div className="mt-4 flex items-center text-red-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        Manage Access <span className="ml-1">→</span>
                    </div>
                </Link>

                {/* App Updates */}
                <Link
                    href="/settings/app-updates"
                    className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 ring-2 ring-transparent hover:ring-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        📱
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">App Updates</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Control current app version, broadcast updates, and trigger forced update prompts.
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                        Manage Versions <span className="ml-1">→</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
