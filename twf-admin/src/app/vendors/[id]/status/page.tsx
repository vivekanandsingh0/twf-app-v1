import Link from 'next/link';
import { localDb } from '@/lib/local-db';
import StatusManager from './StatusManager';

export default async function VendorStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch profile containing status
    const profiles = await localDb.profiles.getAll();
    const vendor = profiles.find((p: any) => p.id === id);

    if (!vendor) return <div>Vendor not found</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href={`/vendors/${id}/manage`} className="text-slate-500 text-sm hover:text-slate-800">&larr; Back to Dashboard</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 text-sm">{vendor.full_name}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Shop Status</h1>
                <p className="text-slate-500 text-sm mt-1">Manage the operational status of {vendor.full_name}'s shop.</p>
            </div>

            <StatusManager vendor={vendor} />
        </div>
    );
}
