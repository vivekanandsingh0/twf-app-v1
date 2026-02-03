"use client";

import { useState } from "react";
import Link from "next/link";

export default function ManageFeedPage() {
    const [activeTab, setActiveTab] = useState('articles');

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage User Feed</h1>
                <p className="text-gray-500 mt-1">Curate content, articles, and spotlights for customers.</p>
            </header>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
                <button
                    onClick={() => setActiveTab('articles')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'articles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Articles 📄
                </button>
                <button
                    onClick={() => setActiveTab('spotlights')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'spotlights' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Spotlights ✨
                </button>
            </div>

            {activeTab === 'articles' && <ArticlesSection />}
            {activeTab === 'spotlights' && <SpotlightsSection />}

        </div>
    );
}

function ArticlesSection() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">Published Articles</h3>
                <Link href="/manage-feed/new">
                    <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-200">
                        + Write New Article
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock Article Card */}
                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
                    <div className="h-40 bg-slate-100 relative">
                        {/* Placeholder image */}
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-4xl">🖼️</div>
                    </div>
                    <div className="p-5">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Organic Tips</span>
                        <h4 className="font-bold text-slate-900 mt-2 mb-2 line-clamp-2 text-lg group-hover:text-emerald-700 transition-colors">
                            10 Benefits of Farm-to-Table Veggies
                        </h4>
                        <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                            Discover why locally sourced vegetables contain more nutrients and taste better than store-bought alternatives...
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>Feb 2, 2026</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </div>

                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer border-dashed flex items-center justify-center min-h-[300px] hover:border-emerald-300 hover:bg-emerald-50/30">
                    <div className="text-center">
                        <span className="block text-4xl mb-2 text-slate-300 group-hover:text-emerald-400 transition-colors">+</span>
                        <span className="font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">Create Article</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SpotlightsSection() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Vendor Spotlights</h3>
                    <p className="text-slate-500 text-sm">Highlight top vendors on the user home feed.</p>
                </div>
                <button className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
                    + Add Vendor to Spotlight
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="px-6 py-4 font-bold text-slate-900">Green Valley Farms</td>
                            <td className="px-6 py-4">Feb 1 - Feb 7</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Active</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-red-600 hover:text-red-700 font-bold text-xs">Remove</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
