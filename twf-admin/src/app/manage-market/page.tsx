import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MarketManager from "./MarketManager";

// Force dynamic rendering
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ManageMarketPage() {
    // 1. Fetch all products (for the dropdown/picker)
    const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*, vendor:profiles!vendor_id(full_name)');

    // 2. Fetch all sections
    const { data: sections, error: sectionsError } = await supabase
        .from('market_sections')
        .select('*')
        .order('display_order', { ascending: true });

    // 3. Fetch section products map
    const { data: sectionProducts, error: mappingError } = await supabase
        .from('market_section_products')
        .select('*, product:products(*)');

    if (productsError) {
        return <div className="text-red-500">Error loading products: {productsError.message}</div>;
    }

    if (sectionsError) {
        return <div className="text-red-500">Error loading sections: {sectionsError.message}</div>;
    }

    // Map relationships
    const mappedSections = (sections || []).map(section => {
        const mappedProducts = (sectionProducts || [])
            .filter(sp => sp.section_id === section.id)
            .map(sp => ({
                mappingId: sp.id,
                ...sp.product,
                vendor: allProducts?.find(p => p.id === sp.product?.id)?.vendor
            }));

        return {
            ...section,
            products: mappedProducts
        };
    });

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">Manage Market</h1>
                    <p className="text-slate-500 mt-1 font-medium">Control homepage product sections & visibility</p>
                </div>
            </header>

            <MarketManager initialSections={mappedSections} allProducts={allProducts || []} />
        </div>
    );
}
