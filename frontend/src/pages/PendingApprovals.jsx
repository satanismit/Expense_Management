import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI } from '../services/api';
import Navigation from '../components/Navigation';

const PendingApprovals = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalLoading, setApprovalLoading] = useState({});

  const { user } = useAuth();

  // Redirect if not manager or admin
  if (!['Manager', 'Admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only managers and administrators can approve expenses.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      const response = await expenseAPI.getPendingApprovals();
      setExpenses(response.data.expenses);
    } catch (error) {
      setError('Failed to fetch pending expenses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, action, remarks = '') => {
    setApprovalLoading(prev => ({ ...prev, [expenseId]: true }));
    
    try {
      await expenseAPI.approve(expenseId, {
        action,
        remarks
      });
      
      // Remove the expense from the list since it's no longer pending
      setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
      
      // Show success message
      setError('');
    } catch (error) {
      setError(`Failed to ${action} expense`);
      console.error(error);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-gray-600">Review and approve expense reports</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Pending Expenses</div>
              <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">All expense reports have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onApprove={handleApproval}
                loading={approvalLoading[expense._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Expense Card Component
const ExpenseCard = ({ expense, onApprove, loading }) => {
  const [showRemarks, setShowRemarks] = useState(false);
  const [remarks, setRemarks] = useState('');

  const handleApproveClick = () => {
    onApprove(expense._id, 'approve', remarks);
    setRemarks('');
    setShowRemarks(false);
  };

  const handleRejectClick = () => {
    if (!remarks.trim()) {
      alert('Please provide remarks for rejection');
      return;
    }
    onApprove(expense._id, 'reject', remarks);
    setRemarks('');
    setShowRemarks(false);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {expense.employee_name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{expense.employee_name}</h3>
                <p className="text-sm text-gray-500">{expense.employee_email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{expense.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{expense.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {expense.currency} {expense.amount.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Expense Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Paid By</dt>
                <dd className="mt-1 text-sm text-gray-900">{expense.paid_by}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(expense.submitted_at).toLocaleDateString()}
                </dd>
              </div>
            </div>

            {expense.remarks && (
              <div className="mb-4">
                <dt className="text-sm font-medium text-gray-500">Employee Remarks</dt>
                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {expense.remarks}
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* Approval Actions */}
        <div className="border-t pt-4">
          {!showRemarks ? (
            <div className="flex space-x-3">
              <button
                onClick={handleApproveClick}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRemarks(true)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Remarks {showRemarks && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please provide feedback..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleApproveClick}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Approve with Remarks'}
                </button>
                <button
                  onClick={handleRejectClick}
                  disabled={loading || !remarks.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    setShowRemarks(false);
                    setRemarks('');
                  }}
                  disabled={loading}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;