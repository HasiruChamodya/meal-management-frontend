'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const DIET_TYPES = ['Normal', 'Diabetic', 'S1', 'S2', 'Renal', 'Low Sodium', 'Soft Diet'];
const WARDS = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E', 'ICU', 'Pediatric'];
const MEAL_TYPES = ['Vegetable', 'Egg', 'Chicken', 'Fish', 'Beef', 'Mixed'];
const EXTRA_ITEMS = ['Yoghurt', 'Fresh Milk', 'Fruit Juice', 'Fresh Fruit', 'Bread (Extra)', 'Soup', 'Dessert'];

export default function DietClerkPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mealCounts, setMealCounts] = useState({});
  const [lunchMealType, setLunchMealType] = useState('');
  const [staffMeals, setStaffMeals] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
  });
  const [extraItems, setExtraItems] = useState({});

  // Redirect if not diet-clerk
  if (user?.role !== 'diet-clerk') {
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

  const handleMealCountChange = (diet, ward, value) => {
    setMealCounts((prev) => ({
      ...prev,
      [diet]: {
        ...prev[diet],
        [ward]: value,
      },
    }));
  };

  const handleExtraItemChange = (item, value) => {
    setExtraItems((prev) => ({
      ...prev,
      [item]: value,
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting meal plan:', {
      mealCounts,
      lunchMealType,
      staffMeals,
      extraItems,
    });
    alert('Meal plan submitted successfully!');
  };

  const handleLogout = () => {
    logout();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-base text-primary hover:text-primary/90 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-base text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Daily Meal Cycle Entry</h1>
          <p className="text-lg text-muted-foreground">{currentDate}</p>
        </div>

        <div className="space-y-6">
          {/* Card 1: Meal Counts by Ward */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">Meal Counts by Ward</h2>
              <p className="text-base text-muted-foreground">
                Enter the number of meals needed for each diet type in each ward
              </p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="p-4 text-left text-base font-bold text-foreground">Diet Type</th>
                      {WARDS.map((ward) => (
                        <th key={ward} className="p-4 text-center text-base font-bold text-foreground">
                          {ward}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DIET_TYPES.map((diet) => (
                      <tr key={diet} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4 font-semibold text-base text-foreground">{diet}</td>
                        {WARDS.map((ward) => (
                          <td key={ward} className="p-4">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={mealCounts[diet]?.[ward] || ''}
                              onChange={(e) => handleMealCountChange(diet, ward, e.target.value)}
                              className="w-24 text-center text-lg h-12 border border-border rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Cycle Type & Staff Meals */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">Cycle Type & Staff Meals</h2>
              <p className="text-base text-muted-foreground">
                Select today's lunch protein and enter staff meal counts
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label htmlFor="lunch-type" className="text-base font-semibold text-foreground">
                  Today's Lunch Meal Type
                </label>
                <select
                  id="lunch-type"
                  value={lunchMealType}
                  onChange={(e) => setLunchMealType(e.target.value)}
                  className="w-full text-lg h-14 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select meal type</option>
                  {MEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <label htmlFor="staff-breakfast" className="text-base font-semibold text-foreground">
                    Staff Breakfasts
                  </label>
                  <input
                    id="staff-breakfast"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={staffMeals.breakfast}
                    onChange={(e) => setStaffMeals((prev) => ({ ...prev, breakfast: e.target.value }))}
                    className="w-full text-lg h-14 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="staff-lunch" className="text-base font-semibold text-foreground">
                    Staff Lunches
                  </label>
                  <input
                    id="staff-lunch"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={staffMeals.lunch}
                    onChange={(e) => setStaffMeals((prev) => ({ ...prev, lunch: e.target.value }))}
                    className="w-full text-lg h-14 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="staff-dinner" className="text-base font-semibold text-foreground">
                    Staff Dinners
                  </label>
                  <input
                    id="staff-dinner"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={staffMeals.dinner}
                    onChange={(e) => setStaffMeals((prev) => ({ ...prev, dinner: e.target.value }))}
                    className="w-full text-lg h-14 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Extra Items */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">Extra Items & Special Requests</h2>
              <p className="text-base text-muted-foreground">
                Enter quantities for additional items needed today
              </p>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {EXTRA_ITEMS.map((item) => (
                  <div key={item} className="space-y-3">
                    <label htmlFor={item} className="text-base font-semibold text-foreground">
                      {item}
                    </label>
                    <input
                      id={item}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={extraItems[item] || ''}
                      onChange={(e) => handleExtraItemChange(item, e.target.value)}
                      className="w-full text-lg h-14 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              className="w-full max-w-md h-16 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Submit Today's Meal Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
