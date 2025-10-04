import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI } from '../services/api';

const ManagerApprovals = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await expenseAPI.getPendingApprovals();
      setExpenses(response.data.expenses);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (expenseId, action, remarks = '') => {
    setActionLoading(prev => ({ ...prev, [expenseId]: true }));
    
    try {
      await expenseAPI.approve(expenseId, {
        action,
        remarks
      });
      
      // Remove the expense from the list after action
      setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
      
      // Show success message
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      alert(`Expense ${actionText} successfully!`);
      
    } catch (error) {
      alert(error.response?.data?.error || `Failed to ${action} expense`);
    } finally {
      setActionLoading(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      submitted: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (user?.role !== 'Manager' && user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only managers and admins can view pending approvals.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-gray-600">Review and approve expense reports</p>
            </div>
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-blue-800 text-sm font-medium">
                {expenses.length} pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m6 0h6m-6 6v6m0 0v6m0-6h6m-6 0H9" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">All expenses have been reviewed.</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <li key={expense._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {expense.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              by {expense.employee_name} ({expense.employee_email})
                            </p>
                          </div>
                          {getStatusBadge(expense.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <br />
                            {expense.category}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Amount:</span>
                            <br />
                            <span className="font-semibold text-lg">
                              {expense.amount} {expense.currency}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <br />
                            {expense.expense_date}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Paid by:</span>
                            <br />
                            {expense.paid_by}
                          </div>
                        </div>

                        {expense.remarks && (
                          <div className="mb-3">
                            <span className="font-medium text-gray-700">Remarks:</span>
                            <p className="text-sm text-gray-600 mt-1">{expense.remarks}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Submitted: {expense.submitted_at}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAction(expense._id, 'approve')}
                          disabled={actionLoading[expense._id]}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[expense._id] ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            const remarks = prompt('Rejection reason (optional):');
                            if (remarks !== null) {
                              handleAction(expense._id, 'reject', remarks);
                            }
                          }}
                          disabled={actionLoading[expense._id]}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[expense._id] ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovals;