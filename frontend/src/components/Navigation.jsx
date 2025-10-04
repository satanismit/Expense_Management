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
        label: 'Approvals',
        roles: ['Manager']
      });
    }

    if (user?.role === 'Admin') {
      links.push(
        {
          path: '/user-management',
          label: 'Manage Users',
          roles: ['Admin']
        },
        {
          path: '/all-expenses',
          label: 'All Expenses',
          roles: ['Admin']
        },
        {
          path: '/approval-settings',
          label: 'Settings',
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
          className={`group inline-flex items-center px-4 py-2 rounded-button text-sm font-medium transition-all duration-200 ${
            isActive(link.path)
              ? 'bg-primary text-white shadow-button'
              : 'text-textLight hover:text-textDark hover:bg-gray-100'
          }`}
        >
          {link.label}
        </Link>
      ));
  };

  return (
    <nav className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-r from-secondary to-primary w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-textDark tracking-tight">ExpenseFlow</h1>
                <p className="text-xs text-textLight">Enterprise Edition</p>
              </div>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-2">
              {renderLinks()}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-textDark">{user?.name}</span>
              <span className="text-xs text-textLight">{user?.role} • {user?.company_name}</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-secondary hover:bg-gray-800 text-white px-4 py-2 rounded-button text-sm font-medium transition-colors duration-200 shadow-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-border">
        <div className="px-4 py-2 space-y-1">
          {renderLinks()}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
