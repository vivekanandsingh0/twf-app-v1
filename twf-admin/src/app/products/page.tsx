import { db } from "@/lib/db";

export const revalidate = 0;

export default async function ProductsValid() {
    const { data: products, error } = await db.products.getAll();

    if (error) {
        return <div className="text-red-500">Error loading products: {error.message}</div>;
    }

    return (
        <div>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your inventory</p>
                </div>
                <button className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors">
                    + Add Product
                </button>
            </header>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Price / Unit</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products?.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        {product.image_url && (
                                            <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        )}
                                        <div>
                                            {product.name}
                                            {product.discount && <span className="ml-2 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{product.discount}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        {/* @ts-ignore relationship join */}
                                        <span className="font-bold text-gray-900">{product.vendor?.full_name || 'System'}</span>
                                        {/* @ts-ignore relationship join */}
                                        <span className="text-xs text-gray-400">{product.farmers?.name || 'Farm Source'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium">
                                    {product.price.toFixed(2)} <span className="text-gray-400 font-normal">{product.unit}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4 text-right gap-2">
                                    <button className="text-blue-600 hover:text-blue-900 font-medium text-xs mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900 font-medium text-xs">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {products?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
