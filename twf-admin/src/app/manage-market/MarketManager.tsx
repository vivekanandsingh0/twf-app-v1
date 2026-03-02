"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MarketManager({ initialSections, allProducts }: { initialSections: any[], allProducts: any[] }) {
    const [sections, setSections] = useState(initialSections);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

    // Filter state for product drawer
    const [searchQuery, setSearchQuery] = useState("");

    // Sort sections by display order locally
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

    const handleCreateSection = async () => {
        if (!newSectionName.trim()) return;
        setIsLoading(true);
        try {
            const display_order = sortedSections.length;
            const { data, error } = await supabase
                .from('market_sections')
                .insert([{ name: newSectionName, display_order }])
                .select()
                .single();

            if (error) throw error;

            setSections([...sections, { ...data, products: [] }]);
            setNewSectionName("");
            setIsAddingSection(false);
        } catch (error) {
            console.error(error);
            alert("Failed to create section");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!window.confirm("Are you sure you want to delete this section? All its product mappings will be removed.")) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('market_sections').delete().eq('id', sectionId);
            if (error) throw error;
            setSections(sections.filter(s => s.id !== sectionId));
        } catch (error) {
            console.error(error);
            alert("Failed to delete section");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToSection = async (sectionId: string, productId: string) => {
        setIsLoading(true);
        try {
            // Check max 10 limits or dups if needed...
            const existing = sortedSections.find(s => s.id === sectionId)?.products.find((p: any) => p.id === productId);
            if (existing) {
                alert("Product is already in this section");
                return;
            }

            const { data, error } = await supabase
                .from('market_section_products')
                .insert([{ section_id: sectionId, product_id: productId }])
                .select()
                .single();

            if (error) throw error;

            // Update local state securely
            const newlyMappedProduct = allProducts.find(p => p.id === productId);
            setSections(prev => prev.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        products: [...s.products, { ...newlyMappedProduct, mappingId: data.id }]
                    };
                }
                return s;
            }));

            setEditingSectionId(null);
            setSearchQuery("");

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to add product");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveProduct = async (sectionId: string, mappingId: string) => {
        if (!window.confirm("Remove this product from the section?")) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('market_section_products').delete().eq('id', mappingId);
            if (error) throw error;

            setSections(prev => prev.map(s => {
                if (s.id === sectionId) {
                    return { ...s, products: s.products.filter((p: any) => p.mappingId !== mappingId) };
                }
                return s;
            }));
        } catch (error) {
            console.error(error);
            alert("Failed to remove product");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === sortedSections.length - 1)) return;
        setIsLoading(true);
        try {
            const currentSection = sortedSections[index];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            const targetSection = sortedSections[targetIndex];

            // Swap display orders
            const newCurrentOrder = targetSection.display_order;
            const newTargetOrder = currentSection.display_order;

            // Optimistic Update
            setSections(prev => prev.map(s => {
                if (s.id === currentSection.id) return { ...s, display_order: newCurrentOrder };
                if (s.id === targetSection.id) return { ...s, display_order: newTargetOrder };
                return s;
            }));

            // Sync with DB concurrently
            await Promise.all([
                supabase.from('market_sections').update({ display_order: newCurrentOrder }).eq('id', currentSection.id),
                supabase.from('market_sections').update({ display_order: newTargetOrder }).eq('id', targetSection.id)
            ]);

        } catch (error) {
            console.error(error);
            alert("Failed to reorder sections");
            // Optionally, we could rollback local state here by re-fetching if it fails
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-32">

            {/* Header / Add Button */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl border border-emerald-100 shadow-inner">
                        🛒
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Marketplace Sections</h2>
                        <p className="text-sm font-medium text-slate-500">Curated blocks displayed on the customer app home screen.</p>
                    </div>
                </div>
                {!isAddingSection && (
                    <button
                        onClick={() => setIsAddingSection(true)}
                        className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                    >
                        <span>+</span> New Section
                    </button>
                )}
            </div>

            {/* Inline Add Section Form */}
            {isAddingSection && (
                <div className="bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl shadow-sm animate-fade-in-down flex items-end gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2 block">Section Display Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Featured Farmers, Daily Essentials, Organic Roots"
                            className="w-full p-3 rounded-xl border border-emerald-200 bg-white shadow-inner font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-800"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        onClick={handleCreateSection}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex-shrink-0"
                    >
                        Save Section
                    </button>
                    <button
                        onClick={() => setIsAddingSection(false)}
                        className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex-shrink-0"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Sections List */}
            {sortedSections.length === 0 && !isAddingSection ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-16 text-center">
                    <div className="text-4xl mb-4">🤷‍♂️</div>
                    <h3 className="text-xl font-bold text-slate-900">No Sections Created</h3>
                    <p className="text-slate-500 mt-2">Start curating your marketplace by creating a new section.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {sortedSections.map((section, index) => (
                        <div key={section.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">

                            {/* Section Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-5 px-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs hidden sm:block">Section</span>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{section.name}</h3>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2">
                                        {section.products?.length || 0} Products
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="flex bg-slate-100 rounded-lg p-0.5 shadow-inner mr-2">
                                        <button
                                            onClick={() => handleMoveSection(index, 'up')}
                                            disabled={index === 0 || isLoading}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-emerald-600 hover:shadow-sm text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all font-bold"
                                            title="Move Up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMoveSection(index, 'down')}
                                            disabled={index === sortedSections.length - 1 || isLoading}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-emerald-600 hover:shadow-sm text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all font-bold"
                                            title="Move Down"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setEditingSectionId(section.id)}
                                        className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                        + Add Product
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Section Products Container */}
                            <div className="p-6">
                                {/* Inline Product Picker for this section */}
                                {editingSectionId === section.id && (
                                    <div className="mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl animate-fade-in-down shadow-inner">
                                        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                                            <h4 className="font-bold text-slate-800 text-sm">Select Product to Add</h4>
                                            <button onClick={() => { setEditingSectionId(null); setSearchQuery(""); }} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded text-slate-600 font-bold hover:bg-slate-100">Close</button>
                                        </div>
                                        <input
                                            placeholder="Search product manually..."
                                            className="w-full p-2 border border-slate-200 rounded-lg mb-3 focus:outline-emerald-500 font-medium text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar bg-white rounded-lg border border-slate-100">
                                            {allProducts
                                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.vendor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .slice(0, 50) // limit results visually
                                                .map(product => {
                                                    const isAlreadyAdded = section.products?.some((p: any) => p.id === product.id);
                                                    return (
                                                        <div key={product.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded shadow-sm border border-slate-200" />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded font-bold">{product.name.charAt(0)}</div>
                                                                )}
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm leading-tight">{product.name}</p>
                                                                    <p className="text-xs text-slate-500 font-medium">{product.vendor?.full_name || 'System'}</p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                disabled={isAlreadyAdded || isLoading}
                                                                onClick={() => handleAddProductToSection(section.id, product.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAlreadyAdded
                                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                                    : 'bg-slate-900 text-white hover:bg-black shadow-md border border-slate-800'
                                                                    }`}
                                                            >
                                                                {isAlreadyAdded ? 'Added ✓' : 'Add'}
                                                            </button>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Actual Products Grid */}
                                {section.products?.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                        Empty Section. Click '+ Add Product' above.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {section.products?.map((product: any) => (
                                            <div key={product.mappingId} className="relative bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group/card">
                                                <button
                                                    onClick={() => handleRemoveProduct(section.id, product.mappingId)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-600 hover:scale-110"
                                                >×</button>

                                                <div className="w-16 h-16 rounded-lg bg-emerald-50 mb-3 overflow-hidden shadow-inner flex shrink-0 border border-slate-100">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-emerald-300 text-2xl">{product.name?.charAt(0)}</div>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1 w-full" title={product.name}>{product.name}</h4>
                                                <p className="text-emerald-700 font-bold text-xs mt-1">₹{product.price}<span className="text-[10px] text-slate-400 font-medium">/{product.unit}</span></p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate mt-1 w-full px-2" title={product.vendor?.full_name}>From: {product.vendor?.full_name || 'System'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
