import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderLinks = () => {
    const links = [
      {
        path: '/dashboard',
        label: 'Dashboard',
        roles: ['Admin', 'Manager', 'Employee']
      }
    ];

    // Add role-specific links
    if (user?.role === 'Employee') {
      links.push(
        {
          path: '/submit-expense',
          label: 'Submit Expense',
          roles: ['Employee']
        },
        {
          path: '/my-expenses',
          label: 'My Expenses',
          roles: ['Employee']
        }
      );
    }

    if (user?.role === 'Manager') {
      links.push({
        path: '/pending-approvals',
        label: 'Pending Approvals',
        roles: ['Manager']
      });
    }

    if (user?.role === 'Admin') {
      links.push(
        {
          path: '/user-management',
          label: 'User Management',
          roles: ['Admin']
        },
        {
          path: '/all-expenses',
          label: 'All Expenses',
          roles: ['Admin']
        }
      );
    }

    // Add profile for all users
    links.push({
      path: '/profile',
      label: 'Profile',
      roles: ['Admin', 'Manager', 'Employee']
    });

    return links
      .filter(link => link.roles.includes(user?.role))
      .map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
            isActive(link.path)
              ? 'border-blue-500 text-gray-900'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          {link.label}
        </Link>
      ));
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Oddu Expense Manager</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {renderLinks()}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm text-gray-500">
                {user?.name} ({user?.role})
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
