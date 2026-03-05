import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileText } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PURCHASE_ORDERS = [
  { id: "po-101", date: "2026-03-05", billNo: "PO-2026-03-05-A", status: "approved", itemCount: 42, totalRs: 125400.00 },
  { id: "po-102", date: "2026-03-05", billNo: "PO-2026-03-05-B", status: "pending", itemCount: 15, totalRs: 45000.00 },
  { id: "po-103", date: "2026-03-04", billNo: "PO-2026-03-04-C", status: "rejected", itemCount: 28, totalRs: 89200.50 },
  { id: "po-104", date: "2026-03-03", billNo: "PO-2026-03-03-A", status: "approved", itemCount: 110, totalRs: 310500.00 },
  { id: "po-105", date: "2026-03-06", billNo: "PO-2026-03-06-DRAFT", status: "draft", itemCount: 0, totalRs: 0 },
];

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase Orders</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage daily calculated ingredient orders.</p>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold w-32">Date</th>
                <th className="px-5 py-3.5 font-semibold">Bill #</th>
                <th className="px-5 py-3.5 font-semibold w-40">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right w-24">Items</th>
                <th className="px-5 py-3.5 font-semibold text-right w-40">Total (Rs)</th>
                <th className="px-4 py-3.5 w-10"></th> {/* Spacer for chevron */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_PURCHASE_ORDERS.map((po) => (
                <tr 
                  key={po.id} 
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors group"
                  onClick={() => navigate(`/orders/${po.id}`)}
                >
                  
                  {/* Date */}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {po.date}
                  </td>
                  
                  {/* Bill Number */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="font-bold text-gray-900">{po.billNo}</span>
                    </div>
                  </td>
                  
                  {/* Status Badge */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLES[po.status]}`}>
                      {STATUS_LABELS[po.status]}
                    </span>
                  </td>
                  
                  {/* Item Count */}
                  <td className="px-5 py-4 text-right text-gray-600 font-medium">
                    {po.itemCount > 0 ? po.itemCount : "—"}
                  </td>
                  
                  {/* Total */}
                  <td className="px-5 py-4 text-right font-black text-gray-900">
                    {po.totalRs > 0 
                      ? `Rs. ${po.totalRs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : <span className="text-gray-400 font-medium">—</span>
                    }
                  </td>

                  {/* Indicator */}
                  <td className="px-4 py-4 text-right">
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors ml-auto" />
                  </td>

                </tr>
              ))}

              {MOCK_PURCHASE_ORDERS.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Orders;