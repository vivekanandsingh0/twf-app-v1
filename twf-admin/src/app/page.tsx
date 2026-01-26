
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // RLS might hide counts for secure tables if not using Service Role key
  // But Public tables like Products/Farmers should show counts.

  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: farmersCount } = await supabase.from('farmers').select('*', { count: 'exact', head: true });

  // This might return 0 if RLS is strict and we are anon
  const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Connected to Supabase</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Inventory</h2>
          <p className="text-4xl font-extrabold text-gray-900">{productsCount || 0}</p>
          <p className="text-gray-400 text-sm mt-2">Active Products</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Farmers / Vendors</h2>
          <p className="text-4xl font-extrabold text-green-600">{farmersCount || 0}</p>
          <p className="text-gray-400 text-sm mt-2">Verified Partners</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Users (Profiles)</h2>
          <p className="text-4xl font-extrabold text-blue-600">{profilesCount || 0}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">RLS Protected</span>
            <p className="text-gray-400 text-sm">Visible records</p>
          </div>
        </div>

      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center ">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Build</h3>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          This admin panel connects to the same database as your mobile app.
          Use this space to manage products, orders, and verify farmers.
        </p>
        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-black transition-colors">
          Manage Products &rarr;
        </button>
      </div>
    </div>
  );
}
