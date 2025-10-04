import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, userAPI } from '../services/api';
import Navigation from '../components/Navigation';

const ApprovalSettings = () => {
  const [approvers, setApprovers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  // Redirect if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can configure approval settings.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [managersResponse, approvalResponse] = await Promise.all([
        userAPI.getManagers(),
        adminAPI.getApprovalChain().catch(() => ({ data: { approvers: [] } })) // Handle if not set yet
      ]);
      
      setManagers(managersResponse.data.managers);
      setApprovers(approvalResponse.data.approvers || []);
    } catch (error) {
      setError('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApprover = () => {
    setApprovers([...approvers, { user_id: '', order: approvers.length + 1 }]);
  };

  const handleRemoveApprover = (index) => {
    const updated = approvers.filter((_, i) => i !== index);
    // Update order for remaining approvers
    const reordered = updated.map((approver, i) => ({ ...approver, order: i + 1 }));
    setApprovers(reordered);
  };

  const handleApproverChange = (index, field, value) => {
    const updated = [...approvers];
    updated[index] = { ...updated[index], [field]: value };
    setApprovers(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate that all approvers have user_id selected
      const invalidApprovers = approvers.filter(a => !a.user_id);
      if (invalidApprovers.length > 0) {
        setError('Please select a user for all approval levels');
        return;
      }

      await adminAPI.setApprovalChain({ approvers });
      setSuccess('Approval settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save approval settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const moveApprover = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === approvers.length - 1)) {
      return;
    }

    const updated = [...approvers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order numbers
    updated.forEach((approver, i) => {
      approver.order = i + 1;
    });
    
    setApprovers(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
                      <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Approval Settings</h1>
              <p className="text-gray-600">Configure expense approval workflow and hierarchy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Approval Hierarchy</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set up the order of approvers for expense reports. Expenses will be routed through this chain for approval.
            </p>
          </div>

          <div className="p-6">
            {approvers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No approval chain configured</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first approver.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleAddApprover}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add First Approver
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {approvers.map((approver, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        {approver.order}
                      </span>
                    </div>

                    <div className="flex-1">
                      <select
                        value={approver.user_id}
                        onChange={(e) => handleApproverChange(index, 'user_id', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Approver</option>
                        {managers.map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name} ({manager.role}) - {manager.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveApprover(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveApprover(index, 'down')}
                        disabled={index === approvers.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveApprover(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handleAddApprover}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Level
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-accent-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-secondary">How Approval Workflow Works</h3>
              <div className="mt-2 text-sm text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>When an employee submits an expense, it goes to the first approver in the hierarchy</li>
                  <li>If approved, it moves to the next level automatically</li>
                  <li>If rejected at any level, the process stops and the employee is notified</li>
                  <li>Only managers and admins can be set as approvers</li>
                  <li>You can reorder levels by using the up/down arrows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalSettings;