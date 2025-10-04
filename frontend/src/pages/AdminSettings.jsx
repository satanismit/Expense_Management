import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Loader from '../components/Loader';

const AdminSettings = () => {
  const [approvalChain, setApprovalChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetChainModal, setShowSetChainModal] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchApprovalChain();
  }, []);

  const fetchApprovalChain = async () => {
    try {
      const response = await adminAPI.getApprovalChain();
      setApprovalChain(response.data.chain || []);
    } catch (error) {
      setError('Failed to fetch approval chain');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetApprovalChain = async (chain) => {
    try {
      await adminAPI.setApprovalChain({ chain });
      setApprovalChain(chain);
      setSuccess('Approval chain updated successfully');
      setShowSetChainModal(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update approval chain');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
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
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Settings
              </h1>
              <p className="text-gray-600">
                Manage approval workflows and system settings
              </p>
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

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Approval Chain Settings */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expense Approval Chain
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Configure the approval workflow for expense submissions. Expenses will need to be approved by each role in the chain in order.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Current Approval Chain</h4>
                  <p className="text-sm text-gray-500">
                    {approvalChain.length > 0 
                      ? approvalChain.join(' → ') 
                      : 'No approval chain set. Expenses will be automatically approved.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowSetChainModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {approvalChain.length > 0 ? 'Update Chain' : 'Set Chain'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              System Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current system configuration and status.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.company_name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Admin User</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.name} ({user?.email})
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Approval Workflow</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {approvalChain.length > 0 ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Set Approval Chain Modal */}
      {showSetChainModal && (
        <SetApprovalChainModal
          currentChain={approvalChain}
          onClose={() => setShowSetChainModal(false)}
          onSave={handleSetApprovalChain}
        />
      )}
    </div>
  );
};

// Set Approval Chain Modal Component
const SetApprovalChainModal = ({ currentChain, onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState(currentChain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRoles = ['Manager', 'Director'];

  const handleRoleToggle = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newRoles = [...selectedRoles];
      [newRoles[index - 1], newRoles[index]] = [newRoles[index], newRoles[index - 1]];
      setSelectedRoles(newRoles);
    }
  };

  const handleMoveDown = (index) => {
    if (index < selectedRoles.length - 1) {
      const newRoles = [...selectedRoles];
      [newRoles[index], newRoles[index + 1]] = [newRoles[index + 1], newRoles[index]];
      setSelectedRoles(newRoles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(selectedRoles);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update approval chain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Set Approval Chain</h3>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Roles
              </label>
              <div className="space-y-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRoles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Order (drag to reorder)
                </label>
                <div className="space-y-2">
                  {selectedRoles.map((role, index) => (
                    <div key={role} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-900">
                        {index + 1}. {role}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedRoles.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Chain'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
