"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Static navigation items the admin can search
const NAV_ITEMS = [
    { label: "Dashboard", description: "Overview & analytics", href: "/", icon: "📊", category: "Pages" },
    { label: "Vendors & Farmers", description: "Manage vendor accounts", href: "/vendors", icon: "👩‍🌾", category: "Pages" },
    { label: "Farmer Payouts", description: "Manage payout requests", href: "/manage-payouts", icon: "💸", category: "Pages" },
    { label: "Products", description: "All listed products", href: "/products", icon: "📦", category: "Pages" },
    { label: "Orders", description: "View & manage orders", href: "/orders", icon: "🛍️", category: "Pages" },
    { label: "Customers", description: "User accounts", href: "/users", icon: "👥", category: "Pages" },
    { label: "Manage Feed", description: "Articles, spotlights & sections", href: "/manage-feed", icon: "📰", category: "Pages" },
    { label: "Categories", description: "Product categories", href: "/manage-categories", icon: "📑", category: "Pages" },
    { label: "Market Sections", description: "Homepage market sections", href: "/manage-market", icon: "🛒", category: "Pages" },
    { label: "Notifications", description: "Send push notifications", href: "/notifications", icon: "🔔", category: "Pages" },
    { label: "Settings", description: "App configuration", href: "/settings", icon: "⚙️", category: "Pages" },
    { label: "Support", description: "User & farmer support", href: "/support", icon: "🎧", category: "Pages" },
];

// Quick actions the admin might search for
const ACTIONS = [
    { label: "Approve Vendors", description: "View pending vendor approvals", href: "/vendors", icon: "✅", category: "Actions" },
    { label: "Send Notification", description: "Push notification to users", href: "/notifications", icon: "📤", category: "Actions" },
    { label: "View All Orders", description: "Browse order history", href: "/orders", icon: "📋", category: "Actions" },
    { label: "Vendor Spotlights", description: "Manage featured vendors", href: "/manage-feed", icon: "⭐", category: "Actions" },
    { label: "Manage Maintenance", description: "Toggle maintenance mode", href: "/settings", icon: "🔧", category: "Actions" },
    { label: "About Us Content", description: "Edit about us page", href: "/settings", icon: "📄", category: "Actions" },
    { label: "App Updates", description: "Manage app version updates", href: "/settings", icon: "🔄", category: "Actions" },
];

interface SearchResult {
    label: string;
    description: string;
    href: string;
    icon: string;
    category: string;
}

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Keyboard shortcut: Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setResults([...NAV_ITEMS.slice(0, 6)]);
            setSelectedIndex(0);
        }
    }, [open]);

    // Search logic
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([...NAV_ITEMS.slice(0, 6)]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = searchQuery.toLowerCase();

        // 1. Search static items
        const navResults = NAV_ITEMS.filter(
            item => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        );
        const actionResults = ACTIONS.filter(
            item => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        );

        // 2. Search live data from Supabase (parallel)
        const [vendorRes, productRes, orderRes, userRes] = await Promise.all([
            supabase.from("profiles").select("id, full_name, phone_number, business_name").eq("user_type", "Vendor").or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%,business_name.ilike.%${q}%`).limit(5),
            supabase.from("products").select("id, name, category").or(`name.ilike.%${q}%,category.ilike.%${q}%`).limit(5),
            supabase.from("orders").select("id, status, total_amount").or(`id.ilike.%${q}%,status.ilike.%${q}%`).limit(5),
            supabase.from("profiles").select("id, full_name, phone_number").eq("user_type", "User").or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%`).limit(5),
        ]);

        const vendorResults: SearchResult[] = (vendorRes.data || []).map((v: any) => ({
            label: v.full_name || v.business_name || "Unnamed Vendor",
            description: v.phone_number || "No phone",
            href: `/vendors/${v.id}`,
            icon: "👩‍🌾",
            category: "Vendors",
        }));

        const productResults: SearchResult[] = (productRes.data || []).map((p: any) => ({
            label: p.name,
            description: p.category || "Uncategorized",
            href: `/products`,
            icon: "📦",
            category: "Products",
        }));

        const orderResults: SearchResult[] = (orderRes.data || []).map((o: any) => ({
            label: `Order #${o.id.slice(0, 8)}`,
            description: `${o.status} — ₹${o.total_amount}`,
            href: `/orders/${o.id}`,
            icon: "🛍️",
            category: "Orders",
        }));

        const userResults: SearchResult[] = (userRes.data || []).map((u: any) => ({
            label: u.full_name || "Unknown User",
            description: u.phone_number || "No phone",
            href: `/users/${u.id}`,
            icon: "👤",
            category: "Customers",
        }));

        setResults([...navResults, ...actionResults, ...vendorResults, ...productResults, ...orderResults, ...userResults]);
        setSelectedIndex(0);
        setLoading(false);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 200);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault();
            navigate(results[selectedIndex].href);
        }
    };

    const navigate = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    // Group results by category
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {});

    // Calculate flat index for highlighting
    let flatIndex = 0;

    if (!open) return (
        <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
        >
            <span className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm group-hover:border-emerald-200 group-hover:shadow-md transition-all">🔍</span>
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 group-hover:text-slate-600 transition-colors">Search anything...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-400 border border-slate-200">
                    Ctrl+K
                </kbd>
            </div>
        </div>
    );

    return (
        <>
            {/* Trigger area (same spot as before) */}
            <div
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 cursor-pointer"
            >
                <span className="bg-white p-2 rounded-lg border border-emerald-200 shadow-sm">🔍</span>
                <span className="text-sm text-emerald-600 font-medium">Searching...</span>
            </div>

            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[12vh] animate-fade-in"
                onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            >
                <div
                    ref={modalRef}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-down"
                    style={{ animation: "slideDown 0.2s ease-out" }}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                        <span className="text-lg">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search pages, vendors, products, orders..."
                            className="flex-1 bg-transparent border-none outline-none text-base text-slate-800 placeholder:text-slate-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {loading && <span className="animate-spin text-sm">⏳</span>}
                        <kbd
                            onClick={() => setOpen(false)}
                            className="px-2 py-1 rounded bg-slate-100 text-xs font-bold text-slate-400 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                        >
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {results.length === 0 && !loading && query && (
                            <div className="p-8 text-center">
                                <div className="text-3xl mb-3">🔍</div>
                                <p className="text-slate-500 font-medium">No results for &quot;{query}&quot;</p>
                                <p className="text-slate-400 text-sm mt-1">Try different keywords</p>
                            </div>
                        )}

                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category}>
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category}</p>
                                </div>
                                {items.map((item) => {
                                    const currentFlatIndex = flatIndex++;
                                    const isSelected = currentFlatIndex === selectedIndex;
                                    return (
                                        <button
                                            key={`${item.href}-${item.label}-${currentFlatIndex}`}
                                            onClick={() => navigate(item.href)}
                                            onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${isSelected ? "bg-emerald-50 text-emerald-800" : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${isSelected ? "bg-emerald-100" : "bg-slate-100"}`}>
                                                {item.icon}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">{item.description}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="text-xs text-emerald-400 font-bold flex-shrink-0">↵ Enter</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold">↑↓</kbd> Navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold">↵</kbd> Open</span>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold">Esc</kbd> Close</span>
                    </div>
                </div>
            </div>

            {/* Inline animation styles */}
            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-16px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.15s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
}
