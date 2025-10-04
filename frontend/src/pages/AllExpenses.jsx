import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI } from '../services/api';
import Navigation from '../components/Navigation';

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();

  // Redirect if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can view all expenses.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      console.log('Fetching all expenses...');
      const response = await expenseAPI.getAll();
      console.log('Expenses response:', response.data);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined, null, or empty status
    const safeStatus = status || 'pending';
    
    const statusClasses = {
      'submitted': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[safeStatus] || 'bg-gray-100 text-gray-800'}`}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </span>
    );
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesFilter = filter === 'all' || (expense.status || 'pending') === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (expense.description || '').toLowerCase().includes(searchLower) ||
                         (expense.employee_name || '').toLowerCase().includes(searchLower) ||
                         (expense.category || '').toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">All Expenses</h1>
              <p className="text-gray-600">Company-wide expense overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by description, employee, or category..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {['submitted', 'pending', 'approved', 'rejected'].map(status => {
            const count = expenses.filter(e => e.status === status).length;
            const amount = expenses.filter(e => e.status === status).reduce((sum, e) => sum + e.amount, 0);
            
            return (
              <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 capitalize">{status}</p>
                      <p className="text-2xl font-semibold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">${amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expenses Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expense Reports ({filteredExpenses.length})
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approver
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.employee_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={expense.description}>
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.approver_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 && !loading && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            {error ? (
              <div className="text-red-600">
                <p className="font-medium">Error loading expenses:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : expenses.length === 0 ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses submitted yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Employees need to submit expense reports before they appear here.
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No expenses found matching your criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllExpenses;