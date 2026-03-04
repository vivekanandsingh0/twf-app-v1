
export default function InvoiceTemplate({ order }: { order: any }) {
    return (
        <div id="invoice-print-area" className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-emerald-700 tracking-tight mb-2">INVOICE</h1>
                    <p className="text-gray-500 font-medium">#{order.id}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Together With Farm</h2>
                    <p className="text-sm text-gray-500">123 Green Way, Agricity</p>
                    <p className="text-sm text-gray-500">support@twf.com</p>
                    <p className="text-sm text-gray-500">+91 99999 99999</p>
                </div>
            </div>

            {/* Dates & People */}
            <div className="flex justify-between mb-10">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
                    <p className="font-bold text-gray-900 text-lg">{order.customerName || order.customer?.full_name || 'Valued Customer'}</p>
                    <p className="text-gray-600 max-w-xs">{order.delivery_address || 'Address on file'}</p>
                    <p className="text-gray-600">{order.customer_phone}</p>

                    {/* Receiver Details */}
                    {(order.receiver_name || order.receiver_phone) && (
                        <div className="mt-4 border-t border-gray-100 pt-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Receiver</p>
                            {order.receiver_name && <p className="font-semibold text-gray-800">{order.receiver_name}</p>}
                            {order.receiver_phone && <p className="text-gray-600">{order.receiver_phone}</p>}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Date</p>
                        <p className="font-semibold text-gray-900">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                        <p className="font-semibold text-gray-900">{order.payment_method || 'COD'}</p>
                    </div>
                </div>
            </div>

            {/* Vendor Info (if specific) */}
            {order.vendor && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fulfilled By</p>
                    <p className="font-bold text-gray-900">{order.vendor.full_name || order.vendor.business_name || 'Multiple Vendors'}</p>
                </div>
            )}

            {/* Items Table */}
            <table className="w-full mb-10">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Item</th>
                        <th className="text-center py-3 text-sm font-bold text-gray-600 uppercase">Qty</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Rate</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item: any, i: number) => (
                        <tr key={i}>
                            <td className="py-4">
                                <p className="font-bold text-gray-900">{item.productName || item.name}</p>
                                <p className="text-xs text-gray-500">{item.productId?.slice(0, 8) || 'SKU-00' + i}</p>
                            </td>
                            <td className="py-4 text-center font-medium text-gray-600">{item.quantity}</td>
                            <td className="py-4 text-right font-medium text-gray-600">₹{item.price}</td>
                            <td className="py-4 text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{Number(order.items?.reduce((acc: number, x: any) => acc + (x.price * x.quantity), 0) || order.total_amount).toFixed(2)}</span>
                    </div>
                    {Number(order.shipping_fee || 0) > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>₹{Number(order.shipping_fee).toFixed(2)}</span>
                        </div>
                    )}
                    {Number(order.discount || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{Number(order.discount).toFixed(2)}</span>
                        </div>
                    )}
                    {Number(order.coupon_discount || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Coupon Discount</span>
                            <span>-₹{Number(order.coupon_discount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-gray-300 pt-3 text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{Number(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
                <p className="mb-1">Thank you for shopping with Together With Farm.</p>
                <p>For any queries, please contact us at support@twf.com</p>
            </div>

            {/* Print specific styles to hide everything else */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-print-area, #invoice-print-area * {
                        visibility: visible;
                    }
                    #invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                        margin: 0;
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
