'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedPO, setSelectedPO] = useState(null);

  // Mock data for meal data collection progress
  const mealDataProgress = [
    { wardId: 'W001', wardName: 'Cardiology Ward', status: 'completed', patientsCollected: 45, staffCollected: 8, timestamp: '2025-01-20 09:30' },
    { wardId: 'W002', wardName: 'Orthopedic Ward', status: 'completed', patientsCollected: 38, staffCollected: 6, timestamp: '2025-01-20 08:45' },
    { wardId: 'W003', wardName: 'ICU', status: 'pending', patientsCollected: 12, staffCollected: 3, timestamp: '2025-01-20 10:00' },
    { wardId: 'W004', wardName: 'Pediatric Ward', status: 'completed', patientsCollected: 52, staffCollected: 9, timestamp: '2025-01-20 09:15' },
    { wardId: 'W005', wardName: 'General Ward', status: 'pending', patientsCollected: 28, staffCollected: 4, timestamp: '2025-01-20 10:05' },
  ];

  // Mock data for purchase orders
  const purchaseOrders = [
    {
      id: 'PO-2025-001',
      status: 'sent',
      sentDate: '2025-01-20',
      sentTime: '11:30 AM',
      totalAmount: '$2,450.00',
      items: [
        { name: 'Chicken', quantity: '50 kg', price: '$400' },
        { name: 'Rice', quantity: '80 kg', price: '$200' },
        { name: 'Vegetables', quantity: '60 kg', price: '$180' },
        { name: 'Oil', quantity: '15 L', price: '$90' },
      ]
    },
    {
      id: 'PO-2025-002',
      status: 'pending',
      sentDate: null,
      totalAmount: '$1,850.00',
      items: [
        { name: 'Fish', quantity: '35 kg', price: '$350' },
        { name: 'Eggs', quantity: '10 dozen', price: '$120' },
      ]
    }
  ];

  const completedWards = mealDataProgress.filter(w => w.status === 'completed').length;
  const totalMeals = mealDataProgress.reduce((sum, w) => sum + w.patientsCollected + w.staffCollected, 0);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-base text-primary hover:text-primary/90 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-base text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Monitoring & System Management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-6 py-3 font-medium text-base transition-colors ${
              activeTab === 'monitoring'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Meal Data Progress
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium text-base transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Purchase Orders
          </button>
        </div>

        {/* Meal Data Collection Progress */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Wards Completed</p>
                    <p className="text-3xl font-bold text-foreground">{completedWards}/{mealDataProgress.length}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-success opacity-50" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Meals Collected</p>
                    <p className="text-3xl font-bold text-foreground">{totalMeals}</p>
                  </div>
                  <AlertCircle className="h-12 w-12 text-primary opacity-50" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pending Wards</p>
                    <p className="text-3xl font-bold text-foreground">{mealDataProgress.length - completedWards}</p>
                  </div>
                  <Clock className="h-12 w-12 text-warning opacity-50" />
                </div>
              </div>
            </div>

            {/* Detailed Ward Progress */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">Ward-by-Ward Status</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Ward</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Patients</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Staff</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealDataProgress.map((ward) => (
                      <tr key={ward.wardId} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{ward.wardName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                            ward.status === 'completed'
                              ? 'bg-success/20 text-success'
                              : 'bg-warning/20 text-warning'
                          }`}>
                            {ward.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            {ward.status.charAt(0).toUpperCase() + ward.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-foreground">{ward.patientsCollected}</td>
                        <td className="px-6 py-4 text-center font-medium text-foreground">{ward.staffCollected}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{ward.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Orders Monitoring */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{po.id}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Total: {po.totalAmount}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      po.status === 'sent'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {po.status === 'sent' ? 'Sent' : 'Pending'}
                    </span>
                  </div>

                  {po.status === 'sent' && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Sent on {po.sentDate} at {po.sentTime}
                    </p>
                  )}

                  <button
                    onClick={() => setSelectedPO(selectedPO?.id === po.id ? null : po)}
                    className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium text-base"
                  >
                    <Eye className="h-4 w-4" />
                    {selectedPO?.id === po.id ? 'Hide Details' : 'View Details'}
                  </button>

                  {selectedPO?.id === po.id && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-4">Order Items:</h4>
                      <div className="space-y-3">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name} - {item.quantity}</span>
                            <span className="font-semibold text-foreground">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
