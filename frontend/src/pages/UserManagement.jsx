import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navigation from '../components/Navigation';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useAuth();

  // Redirect if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.list();
      setUsers(response.data.users);
    } catch (error) {
      setError('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await userAPI.getManagers();
      setManagers(response.data.managers);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole({ user_id: userId, new_role: newRole });
      await fetchUsers();
      await fetchManagers(); // Refresh managers list
    } catch (error) {
      setError('Failed to update role');
      console.error(error);
    }
  };

  const handleManagerChange = async (userId, managerId) => {
    try {
      await userAPI.assignManager({ 
        user_id: userId, 
        manager_id: managerId || null 
      });
      await fetchUsers();
    } catch (error) {
      setError('Failed to assign manager');
      console.error(error);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage company users and roles
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add User
              </button>
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

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Team Members
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage roles and reporting structure for your team.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((usr) => (
                    <tr key={usr._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {usr.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={usr.manager_id || ''}
                          onChange={(e) => handleManagerChange(usr._id, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">No Manager</option>
                          {managers
                            .filter(manager => manager._id !== usr._id) // Don't show self
                            .map((manager) => (
                              <option key={manager._id} value={manager._id}>
                                {manager.name} ({manager.role})
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usr.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ••••••••
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={() => {
            fetchUsers();
            fetchManagers();
            setShowCreateModal(false);
          }}
          managers={managers}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onUserCreated, managers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    manager_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        manager_id: formData.manager_id || undefined,
      };
      await userAPI.create(submitData);
      onUserCreated();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              >
                <option value="">No Manager</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>

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
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-accent-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;