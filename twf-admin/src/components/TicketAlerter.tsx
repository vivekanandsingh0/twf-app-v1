
'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';


// Since we had issue with imports, I'll initialize here or better yet, create a shared client file to avoid dups.
// But for now, let's initialize here to be safe and quick as I did in TicketThread.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tiny-base-2323twf0api.rksuccessor.workers.dev';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bmtwc2F4eGRiZG5ya3h0dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE3OTgsImV4cCI6MjA4NDU2Nzc5OH0.mCEbcvs0gucOC2IBoYxS8CLAWfwDVDRdsaiD8G4dWrs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TicketAlerter() {
    const [openTickets, setOpenTickets] = useState<any[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        const checkTickets = async () => {
            try {
                // Fetch only Open tickets
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('status', 'Open');

                if (data) {
                    setOpenTickets(data);
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
                        <a href={`/users/${openTickets[0].user_id}`} className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors">
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
