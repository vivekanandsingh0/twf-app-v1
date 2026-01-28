import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: farmersCount } = await supabase.from('farmers').select('*', { count: 'exact', head: true });
  const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  return (
    <div>
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time platform insights</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="bg-white border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            System Operational
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-200/50"></div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Total Inventory</h2>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-extrabold text-slate-800 tracking-tight">{productsCount || 0}</p>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-slate-400 text-sm mt-2 font-medium">Active Products listed</p>
        </div>

        {/* Card 2 */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-200/50"></div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Farmers / Vendors</h2>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-extrabold text-slate-800 tracking-tight">{farmersCount || 0}</p>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">New</span>
          </div>
          <p className="text-slate-400 text-sm mt-2 font-medium">Verified Partners</p>
        </div>

        {/* Card 3 */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-200/50"></div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Users (Profiles)</h2>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-extrabold text-slate-800 tracking-tight">{profilesCount || 0}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <p className="text-slate-400 text-sm font-medium">Registered Accounts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions / Chart Area Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Recent Activity</h3>
          <p className="text-slate-500 text-sm mb-6">Latest platform events and logs.</p>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${i === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {i === 1 ? '📦' : '👤'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{i === 1 ? 'New Product Added' : 'User Registered'}</p>
                  <p className="text-xs text-slate-400">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden relative">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10 h-full flex flex-col items-start justify-center">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
              ADMIN TOOLS
            </span>
            <h3 className="text-3xl font-bold mb-4">Manage Platform</h3>
            <p className="text-slate-300 max-w-sm leading-relaxed mb-8">
              Access advanced settings, manage users, and configure platform parameters from the control center.
            </p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg shadow-white/10 flex items-center gap-2">
              Access Controls &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
