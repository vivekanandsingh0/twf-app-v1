
'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TicketAlerter() {
    const [openTickets, setOpenTickets] = useState<any[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        const checkTickets = async () => {
            try {
                const res = await fetch('/api/tickets');
                if (res.ok) {
                    const tickets = await res.json();
                    // Find tickets that are Open and NOT created by Admin (though Admin doesn't create tickets usually)
                    // Simply check status 'Open'
                    const pending = tickets.filter((t: any) => t.status === 'Open');
                    setOpenTickets(pending);
                }
            } catch (e) {
                // ignore errors
            }
        };

        checkTickets();
        const interval = setInterval(checkTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    if (openTickets.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
            <div className="bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg p-4 max-w-sm flex items-start gap-4 ring-1 ring-black/5">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    💬
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Support Action Needed</h4>
                    <p className="text-sm text-slate-600 mt-1 mb-2">
                        You have <span className="font-bold text-emerald-600">{openTickets.length}</span> open support tickets waiting for reply.
                    </p>
                    <div className="flex gap-2">
                        {/* Link to the first user with an open ticket as a shortcut */}
                        <a href={`/users/${openTickets[0].userId}/manage`} className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors">
                            Reply to Recent
                        </a>
                        <button onClick={() => setOpenTickets([])} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
