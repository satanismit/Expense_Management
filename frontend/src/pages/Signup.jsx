import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      console.log('Sending signup data:', signupData);
      
      const response = await authAPI.signup(signupData);
      console.log('Signup response:', response);
      
      const { access_token, user } = response.data;
      
      login(user, access_token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error details:', error);
      console.error('Error response:', error.response);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
      } else {
        // Something else happened
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-secondary to-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-textDark tracking-tight">
          ExpenseFlow
        </h2>
        <p className="mt-2 text-center text-sm text-textLight">
          Enterprise Expense Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-border">
          <h3 className="text-2xl font-semibold text-textDark text-center mb-6">
            Create your company account
          </h3>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-textDark mb-2">
                Company Name
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-xl placeholder-textLight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-textDark bg-card"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textDark mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-xl placeholder-textLight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-textDark bg-card"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textDark mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-xl placeholder-textLight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-textDark bg-card"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-textDark mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-xl placeholder-textLight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-textDark bg-card"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-button disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-textLight">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-border text-sm font-medium rounded-xl text-textDark bg-card hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-textLight">
          © 2024 ExpenseFlow Enterprise Edition. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Signup;