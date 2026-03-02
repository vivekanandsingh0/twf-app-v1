"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Category {
    id: string;
    name: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newCatName, setNewCatName] = useState("");
    const [newCatOrder, setNewCatOrder] = useState(0);
    const [newCatImage, setNewCatImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error);
        } else if (data) {
            setCategories(data);
            setNewCatOrder(data.length + 1);
        }
        setLoading(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewCatImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const ext = file.name.split(".").pop();
        const fileName = `cat_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
            .from("categories")
            .upload(fileName, file, { upsert: true });

        if (error) {
            console.error("Upload error:", error);
            return null;
        }
        const { data: urlData } = supabase.storage.from("categories").getPublicUrl(data.path);
        return urlData.publicUrl;
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) {
            alert("Please enter a category name");
            return;
        }

        setSaving(true);
        try {
            let imageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2568"; // fallback

            if (newCatImage) {
                const uploadedUrl = await uploadImage(newCatImage);
                if (uploadedUrl) imageUrl = uploadedUrl;
            }

            const { error } = await supabase.from("categories").insert({
                name: newCatName.trim(),
                image_url: imageUrl,
                display_order: newCatOrder,
                is_active: true
            });

            if (error) {
                if (error.code === '23505') {
                    alert("A category with this name already exists.");
                } else {
                    throw error;
                }
            } else {
                setNewCatName("");
                setNewCatImage(null);
                setPreviewUrl(null);
                fetchCategories();
            }
        } catch (error: any) {
            console.error("Error adding category:", error);
            alert("Failed to add category. Did you run the SQL migration?");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete category");
        } else {
            fetchCategories();
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("categories")
            .update({ is_active: !currentStatus })
            .eq("id", id);

        if (!error) fetchCategories();
    };

    const handleMove = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex(c => c.id === id);
        if (direction === 'up' && currentIndex > 0) {
            const swapTarget = categories[currentIndex - 1];
            await supabase.from("categories").upsert([
                { id: id, display_order: swapTarget.display_order },
                { id: swapTarget.id, display_order: currentOrder }
            ]);
        } else if (direction === 'down' && currentIndex < categories.length - 1) {
            const swapTarget = categories[currentIndex + 1];
            await supabase.from("categories").upsert([
                { id: id, display_order: swapTarget.display_order },
                { id: swapTarget.id, display_order: currentOrder }
            ]);
        }
        fetchCategories();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Add New Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                placeholder="e.g. Exotic Fruits"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Display Order</label>
                            <input
                                type="number"
                                value={newCatOrder}
                                onChange={e => setNewCatOrder(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category Image</label>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                        {previewUrl ? (
                            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-slate-100 mx-auto">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => { setPreviewUrl(null); setNewCatImage(null); }}
                                    className="absolute top-0 right-0 bottom-0 left-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity font-bold"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="h-32 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors cursor-pointer"
                            >
                                <span className="text-2xl mb-1">📷</span>
                                <span className="text-xs font-bold px-4 text-center">Upload Image</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAddCategory}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50"
                    >
                        {saving ? "Adding..." : "Add Category"}
                    </button>
                </div>
            </div>

            {/* List Categories */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Current Categories</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No categories found.</div>
                    ) : categories.map((cat, idx) => (
                        <div key={cat.id} className="p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col gap-1 items-center justify-center mr-2">
                                <button
                                    onClick={() => handleMove(cat.id, cat.display_order, 'up')}
                                    disabled={idx === 0}
                                    className="text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                                >
                                    ▲
                                </button>
                                <span className="text-xs font-bold text-slate-500">{cat.display_order}</span>
                                <button
                                    onClick={() => handleMove(cat.id, cat.display_order, 'down')}
                                    disabled={idx === categories.length - 1}
                                    className="text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                                >
                                    ▼
                                </button>
                            </div>

                            <img src={cat.image_url} alt={cat.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-bold text-slate-800">{cat.name}</h3>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={cat.is_active}
                                            onChange={() => handleToggleActive(cat.id, cat.is_active)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${cat.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cat.is_active ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-slate-600 w-16 text-center">
                                        {cat.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </label>

                                <button
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    className="w-10 h-10 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-colors"
                                    title="Delete Category"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
