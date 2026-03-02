import React from 'react';
import PayoutsManager from './PayoutsManager';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Farmer Payouts | TWF Admin',
    description: 'Manage and process farmer payout requests',
};

export default function ManagePayoutsPage() {
    return <PayoutsManager />;
}
