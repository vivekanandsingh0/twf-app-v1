"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Nutrition", "Storage Tips", "Recipes", "Tips & Tricks", "Agri-Tech", "Farmer Stories", "Health Benefits"];
const TAGS = ["Trending", "New", "Featured", "Must Read"];

interface FeedSection {
    id: string;
    name: string;
}

export default function NewArticlePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Tips & Tricks");
    const [tag, setTag] = useState("New");
    const [readTime, setReadTime] = useState("5 min read");
    const [sectionId, setSectionId] = useState<string | null>(null);
    const [sections, setSections] = useState<FeedSection[]>([]);
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabase.from("feed_sections").select("id, name").order("display_order")
            .then(({ data }) => { if (data) setSections(data as FeedSection[]); });
    }, []);

    // ── Rich Text Toolbar Commands ──────────────────────────────────────────
    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertLink = () => {
        const url = prompt("Enter URL:", "https://");
        if (url) exec("createLink", url);
    };

    const changeFontSize = (size: string) => {
        exec("fontSize", size);
    };

    // ── Cover Image ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setCoverImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const ext = file.name.split(".").pop();
        const fileName = `article_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
            .from("articles")
            .upload(fileName, file, { upsert: true });
        if (error) { console.error(error); return null; }
        const { data: urlData } = supabase.storage.from("articles").getPublicUrl(data.path);
        return urlData.publicUrl;
    };

    // ── Publish / Draft ─────────────────────────────────────────────────────
    const handleSave = async (saveStatus: "draft" | "published") => {
        const content = editorRef.current?.innerHTML || "";
        if (!title.trim()) { setError("Title is required."); return; }
        if (!content.trim() || content === "<br>") { setError("Content cannot be empty."); return; }

        setSaving(true);
        setError(null);

        try {
            let imageUrl: string | null = null;
            if (coverImageFile) {
                setUploading(true);
                imageUrl = await uploadImage(coverImageFile);
                setUploading(false);
            }

            const { error: dbError } = await supabase.from("articles").insert({
                title: title.trim(),
                category,
                tag,
                time: readTime,
                image_url: imageUrl,
                content,
                status: saveStatus,
                type: category === "Agri-Tech" ? "Agri-Tech" : "Tips",
                section_id: sectionId || null,
            });

            if (dbError) throw dbError;

            router.push("/manage-feed");
        } catch (err: any) {
            setError(err.message || "Failed to save article.");
        } finally {
            setSaving(false);
        }
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

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Meta Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Article Title *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full text-xl font-bold border-b-2 border-slate-100 px-0 py-2 focus:border-emerald-500 focus:outline-none transition-colors placeholder:font-normal placeholder:text-slate-300"
                            placeholder="e.g. 5 Reasons to Eat Seasonal Vegetables"
                        />
                    </div>

                    {/* Row: Category, Tag, Read Time, Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tag / Badge</label>
                            <select value={tag} onChange={e => setTag(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm">
                                {TAGS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Read Time</label>
                            <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm" placeholder="5 min read" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Feed Section</label>
                            <select value={sectionId || ""} onChange={e => setSectionId(e.target.value || null)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm">
                                <option value="">— No Section —</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image</label>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        {coverImage ? (
                            <div className="relative h-52 rounded-xl overflow-hidden border border-slate-200">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => { setCoverImage(null); setCoverImageFile(null); }}
                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow"
                                >✕</button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="h-40 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors cursor-pointer"
                            >
                                <span className="text-3xl mb-2">📷</span>
                                <span className="text-sm font-bold">Click to upload cover image</span>
                                <span className="text-xs mt-1 text-slate-300">PNG, JPG, WEBP up to 5MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rich Text Editor Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 p-3 flex flex-wrap items-center gap-1 bg-slate-50">
                        {/* Font Size */}
                        <select
                            onChange={e => changeFontSize(e.target.value)}
                            defaultValue=""
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-400 mr-1"
                        >
                            <option value="" disabled>Size</option>
                            <option value="1">Small</option>
                            <option value="3">Normal</option>
                            <option value="5">Large</option>
                            <option value="7">Huge</option>
                        </select>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Bold, Italic, Underline */}
                        <ToolBtn onClick={() => exec("bold")} title="Bold"><b>B</b></ToolBtn>
                        <ToolBtn onClick={() => exec("italic")} title="Italic"><i>I</i></ToolBtn>
                        <ToolBtn onClick={() => exec("underline")} title="Underline"><u>U</u></ToolBtn>
                        <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough"><s>S</s></ToolBtn>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Alignment */}
                        <ToolBtn onClick={() => exec("justifyLeft")} title="Align Left">⬅</ToolBtn>
                        <ToolBtn onClick={() => exec("justifyCenter")} title="Center">☰</ToolBtn>
                        <ToolBtn onClick={() => exec("justifyRight")} title="Align Right">➡</ToolBtn>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Lists */}
                        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet List">• List</ToolBtn>
                        <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered List">1. List</ToolBtn>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Heading */}
                        <ToolBtn onClick={() => exec("formatBlock", "H2")} title="Heading">H2</ToolBtn>
                        <ToolBtn onClick={() => exec("formatBlock", "H3")} title="Sub-heading">H3</ToolBtn>
                        <ToolBtn onClick={() => exec("formatBlock", "P")} title="Paragraph">P</ToolBtn>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* Link */}
                        <ToolBtn onClick={insertLink} title="Insert Link">🔗 Link</ToolBtn>

                        {/* Undo / Redo */}
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("undo")} title="Undo">↩</ToolBtn>
                        <ToolBtn onClick={() => exec("redo")} title="Redo">↪</ToolBtn>
                    </div>

                    {/* Editable Area */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="min-h-[400px] p-6 focus:outline-none text-slate-700 leading-relaxed text-base"
                        style={{ fontFamily: "inherit" }}
                        data-placeholder="Start writing your article here..."
                        onInput={() => { }}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 font-medium">Status:</span>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as any)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-emerald-400"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleSave("draft")}
                            disabled={saving}
                            className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave("published")}
                            disabled={saving || uploading}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <><span className="animate-spin">⏳</span> {uploading ? "Uploading..." : "Publishing..."}</>
                            ) : "🚀 Publish Article"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Placeholder CSS */}
            <style>{`
                [contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #cbd5e1;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-emerald-700 rounded-lg transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
        >
            {children}
        </button>
    );
}
