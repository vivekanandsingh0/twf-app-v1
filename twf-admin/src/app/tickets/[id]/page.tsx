import { db } from "@/lib/db";
import TicketThread from "./TicketThread";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: ticket } = await db.tickets.getById(id);

    if (!ticket) {
        notFound();
    }

    // Get user details if possible (assuming ticket has user_id)
    // We can fetch profile or assume it was joined?
    // Supabase join isn't automatic in simple `from`, we need to join in `db.tickets.getById` or fetch separately.
    // Let's modify db.tickets.getById first to include user details if important -> YES it is.

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <Link href={`/users/${ticket.user_id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                    <span>&larr; Back to Customer Profile</span>
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-slate-900">#{ticket.id.split('-')[0]}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
                                    ticket.status === 'Closed' ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h2 className="text-lg font-medium text-slate-700">{ticket.subject}</h2>
                    </div>
                    {/* Actions if any */}
                </div>

                {/* Chat Interface Component */}
                <TicketThread ticket={ticket} />
            </div>
        </div>
    );
}
