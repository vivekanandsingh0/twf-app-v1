"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Article {
    id: string;
    title: string;
    category: string;
    tag: string;
    time: string;
    image_url: string | null;
    status: "draft" | "published";
    created_at: string;
    section_id: string | null;
}

interface FeedSection {
    id: string;
    name: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export default function ManageFeedPage() {
    const [activeTab, setActiveTab] = useState("articles");

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage User Feed</h1>
                <p className="text-gray-500 mt-1">Curate content, sections, and spotlights for customers.</p>
            </header>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
                {[
                    { key: "articles", label: "Articles 📄" },
                    { key: "sections", label: "Sections 📂" },
                    { key: "spotlights", label: "Spotlights ✨" },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "articles" && <ArticlesTab />}
            {activeTab === "sections" && <SectionsTab />}
            {activeTab === "spotlights" && <SpotlightsTab />}
        </div>
    );
}

// ─── ARTICLES TAB ────────────────────────────────────────────────────────────

function ArticlesTab() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [sections, setSections] = useState<FeedSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [filterSection, setFilterSection] = useState<string>("all");

    const fetchData = async () => {
        setLoading(true);
        const [{ data: arts }, { data: secs }] = await Promise.all([
            supabase.from("articles").select("*").order("created_at", { ascending: false }),
            supabase.from("feed_sections").select("*").order("display_order"),
        ]);
        if (arts) setArticles(arts as Article[]);
        if (secs) setSections(secs as FeedSection[]);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this article?")) return;
        setDeleting(id);
        await supabase.from("articles").delete().eq("id", id);
        setArticles(prev => prev.filter(a => a.id !== id));
        setDeleting(null);
    };

    const toggleStatus = async (article: Article) => {
        const newStatus = article.status === "published" ? "draft" : "published";
        await supabase.from("articles").update({ status: newStatus }).eq("id", article.id);
        setArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: newStatus } : a));
    };

    const assignSection = async (articleId: string, sectionId: string | null) => {
        await supabase.from("articles").update({ section_id: sectionId }).eq("id", articleId);
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, section_id: sectionId } : a));
    };

    const filtered = filterSection === "all"
        ? articles
        : filterSection === "none"
            ? articles.filter(a => !a.section_id)
            : articles.filter(a => a.section_id === filterSection);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Published Articles</h3>
                    <p className="text-slate-500 text-sm">{articles.filter(a => a.status === "published").length} published · {articles.filter(a => a.status === "draft").length} drafts</p>
                </div>
                <Link href="/manage-feed/new">
                    <button className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 flex items-center gap-2">
                        ✏️ Write New Article
                    </button>
                </Link>
            </div>

            {/* Section Filter */}
            {sections.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by section:</span>
                    {[{ id: "all", name: "All" }, { id: "none", name: "No Section" }, ...sections].map(s => (
                        <button
                            key={s.id}
                            onClick={() => setFilterSection(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterSection === s.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                            <div className="h-40 bg-slate-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                                <div className="h-5 bg-slate-100 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-5xl mb-4">📝</p>
                    <h3 className="font-bold text-slate-700 text-lg mb-2">No articles yet</h3>
                    <Link href="/manage-feed/new">
                        <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors mt-4">
                            Write First Article
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(article => (
                        <div key={article.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {article.image_url ? (
                                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-4xl">🖼️</div>
                                )}
                                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold ${article.status === "published" ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
                                    {article.status === "published" ? "● Live" : "◌ Draft"}
                                </div>
                            </div>

                            <div className="p-5">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{article.category}</span>
                                <h4 className="font-bold text-slate-900 mb-3 mt-1 line-clamp-2 text-base">{article.title}</h4>

                                {/* Section Assign Dropdown */}
                                <div className="mb-3">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Section</label>
                                    <select
                                        value={article.section_id || ""}
                                        onChange={e => assignSection(article.id, e.target.value || null)}
                                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-emerald-400"
                                    >
                                        <option value="">— No Section —</option>
                                        {sections.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                                    <span>{new Date(article.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                    <span>{article.time}</span>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => toggleStatus(article)}
                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${article.status === "published" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                                    >
                                        {article.status === "published" ? "Unpublish" : "Publish"}
                                    </button>
                                    <Link href={`/manage-feed/${article.id}`} className="flex-1">
                                        <button className="w-full text-xs font-bold py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">Edit</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        disabled={deleting === article.id}
                                        className="text-xs font-bold py-2 px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        {deleting === article.id ? "..." : "🗑"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link href="/manage-feed/new">
                        <div className="group bg-white border border-dashed border-slate-200 rounded-2xl flex items-center justify-center min-h-[300px] hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all">
                            <div className="text-center">
                                <span className="block text-4xl mb-2 text-slate-300 group-hover:text-emerald-400 transition-colors">+</span>
                                <span className="font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">Create Article</span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}

// ─── SECTIONS TAB ────────────────────────────────────────────────────────────

function SectionsTab() {
    const [sections, setSections] = useState<FeedSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    const fetchSections = async () => {
        setLoading(true);
        const { data, error: fetchErr } = await supabase.from("feed_sections").select("*").order("display_order");
        if (fetchErr) {
            console.error("fetch sections error:", fetchErr);
            setError(`Could not load sections: ${fetchErr.message}. Make sure you ran the SQL migration.`);
        }
        if (data) setSections(data as FeedSection[]);

        // Get article counts per section
        const { data: arts } = await supabase.from("articles").select("section_id").eq("status", "published");
        if (arts) {
            const counts: Record<string, number> = {};
            arts.forEach((a: any) => {
                if (a.section_id) counts[a.section_id] = (counts[a.section_id] || 0) + 1;
            });
            setArticleCounts(counts);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSections(); }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        setError(null);
        const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 0;
        const { data, error: insertErr } = await supabase.from("feed_sections").insert({
            name: newName.trim(),
            description: newDesc.trim() || null,
            display_order: maxOrder,
            is_active: true,
        }).select().single();
        if (insertErr) {
            console.error("create section error:", insertErr);
            setError(`Failed to create section: ${insertErr.message}`);
        } else if (data) {
            setSections(prev => [...prev, data as FeedSection]);
            setNewName("");
            setNewDesc("");
            setCreating(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this section? Articles in it will become unsectioned.")) return;
        setDeleting(id);
        await supabase.from("articles").update({ section_id: null }).eq("section_id", id);
        await supabase.from("feed_sections").delete().eq("id", id);
        setSections(prev => prev.filter(s => s.id !== id));
        setDeleting(null);
    };

    const toggleActive = async (section: FeedSection) => {
        const newVal = !section.is_active;
        await supabase.from("feed_sections").update({ is_active: newVal }).eq("id", section.id);
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: newVal } : s));
    };

    const moveOrder = async (section: FeedSection, direction: "up" | "down") => {
        const idx = sections.findIndex(s => s.id === section.id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sections.length) return;

        const swapSection = sections[swapIdx];
        const newSections = [...sections];
        newSections[idx] = { ...swapSection, display_order: section.display_order };
        newSections[swapIdx] = { ...section, display_order: swapSection.display_order };
        newSections.sort((a, b) => a.display_order - b.display_order);
        setSections(newSections);

        await Promise.all([
            supabase.from("feed_sections").update({ display_order: section.display_order }).eq("id", swapSection.id),
            supabase.from("feed_sections").update({ display_order: swapSection.display_order }).eq("id", section.id),
        ]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Feed Sections</h3>
                    <p className="text-slate-500 text-sm">Sections appear in the user app feed in order. Assign articles to sections from the Articles tab.</p>
                </div>
                <button
                    onClick={() => { setCreating(true); setError(null); }}
                    className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                >
                    + New Section
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                        <p className="font-bold mb-1">Error</p>
                        <p>{error}</p>
                        {error.includes("migration") && (
                            <p className="mt-2 text-xs text-red-500">
                                Go to <strong>Supabase → SQL Editor</strong> and run:<br />
                                <code className="bg-red-100 px-1 rounded">supabase/migrations/20240218000002_create_feed_sections.sql</code>
                            </p>
                        )}
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">✕</button>
                </div>
            )}

            {/* Create Section Form */}
            {creating && (
                <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4">Create New Section</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Section Name *</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                autoFocus
                                placeholder="e.g. Trending Now, Health Tips, Seasonal Picks..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description (optional)</label>
                            <input
                                type="text"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Short description shown to users..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setCreating(false); setNewName(""); setNewDesc(""); }} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Creating..." : "Create Section"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sections List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-5xl mb-4">📂</p>
                    <h3 className="font-bold text-slate-700 text-lg mb-2">No sections yet</h3>
                    <p className="text-slate-400 text-sm mb-6">Create sections to organise your feed content.</p>
                    <button onClick={() => setCreating(true)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                        Create First Section
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Section Name</th>
                                <th className="px-6 py-4">Articles</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sections.map((section, idx) => (
                                <tr key={section.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveOrder(section, "up")}
                                                disabled={idx === 0}
                                                className="text-slate-400 hover:text-slate-700 disabled:opacity-20 text-xs leading-none"
                                            >▲</button>
                                            <span className="text-xs font-bold text-slate-400 text-center">{idx + 1}</span>
                                            <button
                                                onClick={() => moveOrder(section, "down")}
                                                disabled={idx === sections.length - 1}
                                                className="text-slate-400 hover:text-slate-700 disabled:opacity-20 text-xs leading-none"
                                            >▼</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{section.name}</p>
                                        {section.description && <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                            📄 {articleCounts[section.id] || 0} articles
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(section)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${section.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                                        >
                                            {section.is_active ? "● Active" : "◌ Hidden"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(section.id)}
                                            disabled={deleting === section.id}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs disabled:opacity-50"
                                        >
                                            {deleting === section.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-bold mb-1">💡 How sections work</p>
                <p>Sections appear in the user app feed as separate horizontal scrollable rows. Go to the <strong>Articles</strong> tab to assign any article to a section using the dropdown on each card.</p>
            </div>
        </div>
    );
}

// ─── SPOTLIGHTS TAB ──────────────────────────────────────────────────────────

function SpotlightsTab() {
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
