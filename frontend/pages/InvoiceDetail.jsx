import React from "react";
import { useParams } from "react-router-dom";
import { Download, Printer } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_INVOICES = [
  {
    id: "inv-101",
    date: "2026-03-05",
    billNo: "INV-2026-03-05-A",
    supplier: "Multi Purpose Co-operative Society Ltd, Gampaha",
    categorySummary: [
      { id: 1, name: "Rice / Bread / Noodles", total: 125400.00 },
      { id: 2, name: "Meat / Fish / Egg", total: 85000.00 },
      { id: 3, name: "Vegetables", total: 32000.00 },
      { id: 4, name: "Condiments & Spices", total: 15500.00 },
      { id: 5, name: "Extra Items", total: 5600.00 },
    ],
    grandTotal: 263500.00,
  }
];

// ─── Main Component ──────────────────────────────────────────────────────────

const InvoiceDetail = () => {
  const { id } = useParams();
  
  // Use the matching invoice, or fallback to the first mock invoice for testing
  const inv = MOCK_INVOICES.find((i) => i.id === id) || MOCK_INVOICES[0];

  if (!inv) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24 print:p-0 print:pb-0">
      
      {/* Action Buttons - Hidden when printing */}
      <div className="flex justify-end gap-3 print:hidden">
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <Printer className="h-4 w-4 mr-2 text-gray-500" /> Print Invoice
        </button>
        <button 
          className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <Download className="h-4 w-4 mr-2 text-gray-500" /> Download PDF
        </button>
      </div>

      {/* Printable Invoice Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl max-w-3xl mx-auto print:shadow-none print:border-0 print:rounded-none">
        <div className="p-8 md:p-12 space-y-8">
          
          {/* Invoice Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest">
              Invoice for Raw Provisions
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Date: <span className="text-gray-900">{inv.date}</span> 
              <span className="mx-3 text-gray-300">|</span> 
              Bill No: <span className="text-gray-900">{inv.billNo}</span>
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Address Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="font-bold text-gray-500 uppercase tracking-wider mb-1 text-xs">From:</p>
              <p className="font-bold text-gray-900 text-base leading-relaxed">{inv.supplier}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="font-bold text-gray-500 uppercase tracking-wider mb-1 text-xs">To:</p>
              <p className="font-bold text-gray-900 text-base leading-relaxed">
                Director,<br />
                District General Hospital,<br />
                Yakkala Road, Gampaha.
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-gray-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider w-16 text-center">#</th>
                  <th className="px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider">Invoice Description</th>
                  <th className="px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-right">Total Price (Rs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inv.categorySummary.map((cs) => (
                  <tr key={cs.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-400 font-medium">{cs.id}</td>
                    <td className="px-5 py-4 font-bold text-gray-800">{cs.name}</td>
                    <td className="px-5 py-4 text-right font-black text-gray-900 text-base">
                      {cs.total > 0 ? cs.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center shadow-inner">
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Grand Total</p>
            <p className="text-3xl md:text-4xl font-black text-blue-900">
              Rs. {inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Signature Block */}
          <div className="text-center text-sm text-gray-600 pt-12 pb-4 space-y-4 break-inside-avoid">
            <div className="border-t-2 border-dashed border-gray-300 w-72 mx-auto pt-3">
              <p className="font-bold text-gray-900">Manager</p>
              <p>Multi Purpose Co-operative Society Ltd, Gampaha</p>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default InvoiceDetail;