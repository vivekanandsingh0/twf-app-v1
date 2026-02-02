"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image_url?: string;
    vendor_id: string;
}

export default function InventoryList({ initialProducts, vendorId }: { initialProducts: Product[], vendorId: string }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to dismiss this listing?")) return;

        // Optimistic update
        setProducts(prev => prev.filter(p => p.id !== id));

        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (e) {
            console.error("Failed to delete", e);
            alert("Failed to delete product");
        }
    };

    const handleUpdate = async () => {
        if (!editingProduct) return;
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);

        try {
            await fetch(`/api/products/${editingProduct.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProduct)
            });
            router.refresh();
        } catch (e) {
            console.error("Failed to update", e);
            alert("Failed to update product");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-lg text-slate-800">Product List ({products.length})</h2>
            </div>

            {/* Edit Form Modal/Overlay */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Edit Product</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={editingProduct.stock}
                                        onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                                <button onClick={handleUpdate} className="flex-1 py-2.5 text-white font-bold text-sm bg-emerald-600 rounded-lg hover:bg-emerald-700">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="divide-y divide-slate-100">
                {products.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No products listed for this vendor.
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 transition-colors group">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 border border-slate-200 overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">IMG</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                                <p className="text-xs text-slate-500">
                                    {product.category} • In Stock: <span className={product.stock > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{product.stock}</span>
                                </p>
                            </div>

                            <div className="font-bold text-slate-900 mx-4">
                                ₹{product.price}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingProduct(product)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit Product"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Dismiss Listing"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
