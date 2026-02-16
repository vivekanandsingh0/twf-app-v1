import { db } from "@/lib/db";
import Link from 'next/link';

export default async function UserTickets({ userId }: { userId: string }) {
    const { data: tickets, error } = await db.tickets.getAll(userId);

    if (error) {
        return <p className="text-red-500 text-sm">Failed to load tickets.</p>;
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No support tickets found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket: any) => (
                <div key={ticket.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">{ticket.subject}</h4>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
                                ticket.status === 'Closed' ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {ticket.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {ticket.messages && ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].text : 'No messages'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Updated: {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}</span>
                        <Link href={`/tickets/${ticket.id}`} className="font-bold text-emerald-600 hover:text-emerald-700">
                            View Thread &rarr;
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
