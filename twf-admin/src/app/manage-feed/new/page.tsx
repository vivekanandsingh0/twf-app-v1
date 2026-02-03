"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewArticlePage() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Tips");
    const [content, setContent] = useState("");

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Article Published! (Mock)");
        // Logic to clear form or redirect
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/manage-feed" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
                ← Back to Feed
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Write New Article</h1>
                <p className="text-gray-500 mt-1">Create engaging content for your customers.</p>
            </header>

            <form onSubmit={handlePublish} className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Article Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full text-lg font-bold border-b-2 border-slate-100 px-0 py-2 focus:border-emerald-500 focus:outline-none transition-colors placeholder:font-normal placeholder:text-slate-300"
                                placeholder="e.g. 5 Reasons to Eat Seasonal"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                            >
                                <option>Tips & Tricks</option>
                                <option>Recipes</option>
                                <option>Farmer Stories</option>
                                <option>Health Benefits</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image (Optional)</label>
                            <div className="h-40 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors cursor-pointer">
                                <span className="text-3xl mb-2">📷</span>
                                <span className="text-sm font-bold">Click to upload cover image</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                            <textarea
                                required
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full h-80 border border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-all resize-none"
                                placeholder="Start writing your article here..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        Save Draft
                    </button>
                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-200">
                        Publish Article
                    </button>
                </div>
            </form>
        </div>
    );
}
