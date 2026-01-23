'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, AlertTriangle, CheckCircle, Send, X } from 'lucide-react';

export default function KitchenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preparation');
  const [showQualityForm, setShowQualityForm] = useState(false);
  const [qualityMessage, setQualityMessage] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionItem, setRejectionItem] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data for received ingredients
  const receivedItems = [
    { id: 1, name: 'Chicken Breast', quantity: '50 kg', ordered: '50 kg', status: 'received' },
    { id: 2, name: 'Rice (Basmati)', quantity: '80 kg', ordered: '80 kg', status: 'received' },
    { id: 3, name: 'Mixed Vegetables', quantity: '60 kg', ordered: '60 kg', status: 'received' },
    { id: 4, name: 'Cooking Oil', quantity: '14 L', ordered: '15 L', status: 'received' },
    { id: 5, name: 'Fresh Fish', quantity: '35 kg', ordered: '35 kg', status: 'pending' },
  ];

  const rejectedItems = [
    { id: 101, name: 'Eggs', originalQuantity: '10 dozen', issue: 'Quality poor - many cracked', timestamp: '2025-01-20 09:15' },
  ];

  const handleSendQualityFeedback = () => {
    if (qualityMessage.trim()) {
      console.log('Quality feedback sent:', qualityMessage);
      setQualityMessage('');
      setShowQualityForm(false);
      alert('Quality feedback sent to admin');
    }
  };

  const handleRejectItem = () => {
    if (rejectionItem && rejectionReason) {
      console.log('Item rejected:', { item: rejectionItem, reason: rejectionReason });
      setRejectionItem('');
      setRejectionReason('');
      setShowRejectionForm(false);
      alert('Item rejection notified to admin');
    }
  };

  const handleConfirmAllIngredients = () => {
    const allReceived = receivedItems.every(item => item.status === 'received');
    if (allReceived) {
      console.log('All ingredients confirmed');
      alert('Confirmation sent to admin - All ingredients received and verified');
    } else {
      alert('Cannot confirm - not all items received yet');
    }
  };

  if (user?.role !== 'kitchen') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <button onClick={() => navigate('/login')} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const allReceived = receivedItems.every(item => item.status === 'received');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg text-yellow-400 hover:text-yellow-300">
            <ArrowLeft className="h-6 w-6" />
            Back
          </button>
          <button onClick={() => logout()} className="flex items-center gap-2 text-lg text-red-400 hover:text-red-300">
            <LogOut className="h-6 w-6" />
            Logout
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2">Kitchen Display System</h1>
          <p className="text-xl text-gray-300">Ingredient Management & Quality Control</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('preparation')}
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'preparation'
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Ingredient Verification
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'quality'
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Quality Feedback
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 font-medium text-lg transition-colors relative ${
              activeTab === 'rejected'
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Rejected Items {rejectedItems.length > 0 && <span className="absolute top-2 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{rejectedItems.length}</span>}
          </button>
        </div>

        {/* Ingredient Verification Tab */}
        {activeTab === 'preparation' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-yellow-400/30 rounded-lg p-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">Order Verification</h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-lg">
                  <thead className="bg-slate-700 border-b border-yellow-400/30">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-yellow-400">Item</th>
                      <th className="px-6 py-4 text-center font-bold text-yellow-400">Ordered</th>
                      <th className="px-6 py-4 text-center font-bold text-yellow-400">Received</th>
                      <th className="px-6 py-4 text-left font-bold text-yellow-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-700 hover:bg-slate-700/50">
                        <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                        <td className="px-6 py-4 text-center text-gray-300">{item.ordered}</td>
                        <td className="px-6 py-4 text-center text-gray-300">{item.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-lg ${
                            item.status === 'received'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status === 'received' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {allReceived && (
                <button
                  onClick={handleConfirmAllIngredients}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xl flex items-center justify-center gap-3 transition-colors"
                >
                  <CheckCircle className="h-6 w-6" />
                  Confirm All Ingredients Received
                </button>
              )}

              {!allReceived && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 font-semibold text-lg">
                    Waiting for {receivedItems.filter(i => i.status !== 'received').length} more item(s) to complete verification
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setShowRejectionForm(!showRejectionForm)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-xl flex items-center justify-center gap-3 transition-colors"
              >
                <AlertTriangle className="h-6 w-6" />
                Reject Item
              </button>
              <button
                onClick={() => setShowQualityForm(!showQualityForm)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg text-xl flex items-center justify-center gap-3 transition-colors"
              >
                <Send className="h-6 w-6" />
                Report Quality Issue
              </button>
            </div>
          </div>
        )}

        {/* Quality Feedback Tab */}
        {activeTab === 'quality' && (
          <div className="bg-slate-800 border border-yellow-400/30 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Quality Feedback</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xl font-semibold text-white mb-3">Report Quality Issue</label>
                <textarea
                  value={qualityMessage}
                  onChange={(e) => setQualityMessage(e.target.value)}
                  placeholder="Describe the quality issue: ingredient freshness, cooking quality, taste, or hygiene concerns..."
                  className="w-full bg-slate-900 border border-gray-600 rounded-lg p-4 text-white text-lg placeholder-gray-500 focus:border-yellow-400 focus:outline-none min-h-32"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSendQualityFeedback}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="h-5 w-5" />
                  Send to Admin
                </button>
                <button
                  onClick={() => {
                    setQualityMessage('');
                    setShowQualityForm(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 font-semibold">Admin will be notified immediately about any quality concerns you report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Items Tab */}
        {activeTab === 'rejected' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-yellow-400/30 rounded-lg p-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">Rejected Items Log</h2>

              {rejectedItems.length > 0 ? (
                <div className="space-y-4">
                  {rejectedItems.map((item) => (
                    <div key={item.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-400">{item.name}</h3>
                          <p className="text-red-300 mt-2">Original Quantity: {item.originalQuantity}</p>
                          <p className="text-red-300">Rejection Reason: {item.issue}</p>
                          <p className="text-gray-400 text-sm mt-2">Rejected on: {item.timestamp}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-lg">No rejected items recorded</p>
              )}
            </div>

            {/* Reject New Item Form */}
            {showRejectionForm && (
              <div className="bg-slate-800 border border-red-500/50 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-red-400 mb-6">Reject Ingredient</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-white mb-2">Item Name</label>
                    <input
                      type="text"
                      value={rejectionItem}
                      onChange={(e) => setRejectionItem(e.target.value)}
                      placeholder="Enter item name"
                      className="w-full bg-slate-900 border border-gray-600 rounded-lg p-3 text-white text-lg placeholder-gray-500 focus:border-red-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-white mb-2">Rejection Reason</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-slate-900 border border-gray-600 rounded-lg p-3 text-white text-lg focus:border-red-400 focus:outline-none"
                    >
                      <option value="">Select reason...</option>
                      <option value="quality-poor">Quality is poor</option>
                      <option value="doesn't-match">Doesn't match requested item</option>
                      <option value="quantity-incorrect">Quantity is incorrect</option>
                      <option value="freshness-expired">Not fresh / Expired</option>
                      <option value="other">Other issue</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleRejectItem}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg transition-colors"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setRejectionItem('');
                        setRejectionReason('');
                        setShowRejectionForm(false);
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg text-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
