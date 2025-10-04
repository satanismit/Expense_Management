import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Dashboard = () => {
<<<<<<< HEAD
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    manager_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [generateRandomPassword, setGenerateRandomPassword] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePasswordInModal = () => {
    const newPassword = generatePassword();
    setFormData({ ...formData, password: newPassword });
  }; [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [generatingPassword, setGeneratingPassword] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

=======
>>>>>>> 603d14a2d41431359a0db76bc590c9a555e1201c
  const { user, logout } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const AdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/user-management" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500">Manage company users and roles</p>
            </div>
          </div>
        </div>
      </Link>

      <Link to="/all-expenses" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">All Expenses</h3>
              <p className="text-sm text-gray-500">View all company expenses</p>
            </div>
          </div>
        </div>
      </Link>

      <Link to="/approval-settings" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Approval Settings</h3>
              <p className="text-sm text-gray-500">Configure approval workflows</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  const ManagerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/pending-approvals" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
              <p className="text-sm text-gray-500">Review expense reports</p>
            </div>
          </div>
        </div>
      </Link>

      <Link to="/team-expenses" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Team Expenses</h3>
              <p className="text-sm text-gray-500">View team member expenses</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  const EmployeeDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/submit-expense" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Submit Expense</h3>
              <p className="text-sm text-gray-500">Create a new expense report</p>
            </div>
          </div>
        </div>
      </Link>

      <Link to="/my-expenses" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">My Expenses</h3>
              <p className="text-sm text-gray-500">Track your expense reports</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      case 'Employee':
        return <EmployeeDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

<<<<<<< HEAD
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

  const handleGeneratePassword = async (userId, userName, userEmail) => {
    if (!window.confirm(`Generate a new password for ${userName} (${userEmail})?\n\nThis will send the new password to their email address.`)) {
      return;
    }

    setGeneratingPassword(userId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.generatePassword({ user_id: userId });
      setSuccessMessage(response.data.message);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate password');
    } finally {
      setGeneratingPassword(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

=======
>>>>>>> 603d14a2d41431359a0db76bc590c9a555e1201c
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getWelcomeMessage()}, {user?.name}!
              </h1>
              <p className="text-gray-600">
                {user?.role} Dashboard - {user?.company_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
<<<<<<< HEAD
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Team Members
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage roles and reporting structure for your team. Use the "Generate Password" button to create and send new login credentials to users via email.
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleGeneratePassword(usr._id, usr.name, usr.email)}
                          disabled={generatingPassword === usr._id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate and send new password to user's email"
                        >
                          {generatingPassword === usr._id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              🔑 Generate Password
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
=======
        {/* Quick Stats */}
        <div className="mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              {getDashboardContent()}
>>>>>>> 603d14a2d41431359a0db76bc590c9a555e1201c
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
    setModalError('');

    try {
      const submitData = {
        ...formData,
        manager_id: formData.manager_id || undefined,
      };
      await userAPI.create(submitData);
      onUserCreated();
    } catch (error) {
      setModalError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
          
          {modalError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {modalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type={generateRandomPassword ? "text" : "password"}
                  required
                  className="flex-1 min-w-0 block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={generateRandomPassword ? "Click generate to create password" : "Enter password"}
                />
                <button
                  type="button"
                  onClick={handleGeneratePasswordInModal}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                  title="Generate random password"
                >
                  🎲
                </button>
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={generateRandomPassword}
                    onChange={(e) => setGenerateRandomPassword(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Show generated password</span>
                </label>
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
=======
        {/* Additional Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h2>
            <div className="prose prose-sm text-gray-600">
              {user?.role === 'Employee' && (
                <ul>
                  <li>Submit expense reports for reimbursement</li>
                  <li>Track the status of your submitted expenses</li>
                  <li>View approval history and comments</li>
                </ul>
              )}
              {user?.role === 'Manager' && (
                <ul>
                  <li>Review and approve team member expenses</li>
                  <li>Monitor team spending patterns</li>
                  <li>Provide feedback on expense reports</li>
                </ul>
              )}
              {user?.role === 'Admin' && (
                <ul>
                  <li>Manage company users and assign roles</li>
                  <li>Configure expense approval workflows</li>
                  <li>Monitor company-wide expense trends</li>
                  <li>Set up approval hierarchies and policies</li>
                </ul>
              )}
            </div>
          </div>
>>>>>>> 603d14a2d41431359a0db76bc590c9a555e1201c
        </div>
      </div>
    </div>
  );
};

export default Dashboard;