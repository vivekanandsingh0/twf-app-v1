"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Nutrition", "Storage Tips", "Recipes", "Tips & Tricks", "Agri-Tech", "Farmer Stories", "Health Benefits"];
const TAGS = ["Trending", "New", "Featured", "Must Read"];

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Tips & Tricks");
    const [tag, setTag] = useState("New");
    const [readTime, setReadTime] = useState("5 min read");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
            if (error || !data) { setError("Article not found."); setLoading(false); return; }
            setTitle(data.title);
            setCategory(data.category);
            setTag(data.tag || "New");
            setReadTime(data.time);
            setStatus(data.status);
            setCoverImage(data.image_url);
            if (editorRef.current) editorRef.current.innerHTML = data.content || "";
            setLoading(false);
        };
        fetchArticle();
    }, [id]);

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertLink = () => {
        const url = prompt("Enter URL:", "https://");
        if (url) exec("createLink", url);
    };

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
        const { data, error } = await supabase.storage.from("articles").upload(fileName, file, { upsert: true });
        if (error) return null;
        const { data: urlData } = supabase.storage.from("articles").getPublicUrl(data.path);
        return urlData.publicUrl;
    };

    const handleSave = async (saveStatus: "draft" | "published") => {
        const content = editorRef.current?.innerHTML || "";
        if (!title.trim()) { setError("Title is required."); return; }
        setSaving(true); setError(null);
        try {
            let imageUrl: string | null = coverImage;
            if (coverImageFile) {
                setUploading(true);
                imageUrl = await uploadImage(coverImageFile);
                setUploading(false);
            }
            const { error: dbError } = await supabase.from("articles").update({
                title: title.trim(), category, tag, time: readTime,
                image_url: imageUrl, content, status: saveStatus,
                type: category === "Agri-Tech" ? "Agri-Tech" : "Tips",
                updated_at: new Date().toISOString(),
            }).eq("id", id);
            if (dbError) throw dbError;
            router.push("/manage-feed");
        } catch (err: any) {
            setError(err.message || "Failed to save.");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading article...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/manage-feed" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
                ← Back to Feed
            </Link>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Article</h1>
            </header>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">⚠️ {error}</div>}

            <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Article Title *</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full text-xl font-bold border-b-2 border-slate-100 px-0 py-2 focus:border-emerald-500 focus:outline-none transition-colors placeholder:font-normal placeholder:text-slate-300"
                            placeholder="Article title..." />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tag</label>
                            <select value={tag} onChange={e => setTag(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm">
                                {TAGS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Read Time</label>
                            <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image</label>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        {coverImage ? (
                            <div className="relative h-52 rounded-xl overflow-hidden border border-slate-200">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button onClick={() => { setCoverImage(null); setCoverImageFile(null); }} className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow">✕</button>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors cursor-pointer">
                                <span className="text-3xl mb-2">📷</span>
                                <span className="text-sm font-bold">Click to upload cover image</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rich Text Editor */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 p-3 flex flex-wrap items-center gap-1 bg-slate-50">
                        <select onChange={e => exec("fontSize", e.target.value)} defaultValue="" className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none mr-1">
                            <option value="" disabled>Size</option>
                            <option value="1">Small</option>
                            <option value="3">Normal</option>
                            <option value="5">Large</option>
                            <option value="7">Huge</option>
                        </select>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("bold")}><b>B</b></ToolBtn>
                        <ToolBtn onClick={() => exec("italic")}><i>I</i></ToolBtn>
                        <ToolBtn onClick={() => exec("underline")}><u>U</u></ToolBtn>
                        <ToolBtn onClick={() => exec("strikeThrough")}><s>S</s></ToolBtn>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("justifyLeft")}>⬅</ToolBtn>
                        <ToolBtn onClick={() => exec("justifyCenter")}>☰</ToolBtn>
                        <ToolBtn onClick={() => exec("justifyRight")}>➡</ToolBtn>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("insertUnorderedList")}>• List</ToolBtn>
                        <ToolBtn onClick={() => exec("insertOrderedList")}>1. List</ToolBtn>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("formatBlock", "H2")}>H2</ToolBtn>
                        <ToolBtn onClick={() => exec("formatBlock", "H3")}>H3</ToolBtn>
                        <ToolBtn onClick={() => exec("formatBlock", "P")}>P</ToolBtn>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={insertLink}>🔗 Link</ToolBtn>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolBtn onClick={() => exec("undo")}>↩</ToolBtn>
                        <ToolBtn onClick={() => exec("redo")}>↪</ToolBtn>
                    </div>
                    <div ref={editorRef} contentEditable suppressContentEditableWarning
                        className="min-h-[400px] p-6 focus:outline-none text-slate-700 leading-relaxed text-base"
                        data-placeholder="Article content..." />
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 font-medium">Status:</span>
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-emerald-400">
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleSave("draft")} disabled={saving} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Save Draft</button>
                        <button onClick={() => handleSave("published")} disabled={saving || uploading} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2">
                            {saving ? <><span className="animate-spin">⏳</span> Saving...</> : "💾 Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`[contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #cbd5e1; pointer-events: none; }`}</style>
        </div>
    );
}

function ToolBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-emerald-700 rounded-lg transition-all border border-transparent hover:border-slate-200 hover:shadow-sm">
            {children}
        </button>
    );
}
