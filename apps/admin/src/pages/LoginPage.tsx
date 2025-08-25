import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAdmin, clearError } from '../store/slices/adminSlice';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Typography } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.admin);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Test localStorage functionality
  useEffect(() => {
    console.log('LoginPage: Testing localStorage...');
    try {
      localStorage.setItem('test', 'test-value');
      const testValue = localStorage.getItem('test');
      console.log('LoginPage: localStorage test - stored:', 'test-value', 'retrieved:', testValue);
      localStorage.removeItem('test');
      
      if (testValue !== 'test-value') {
        console.error('LoginPage: localStorage is not working properly!');
      } else {
        console.log('LoginPage: localStorage is working properly');
      }
    } catch (error) {
      console.error('LoginPage: localStorage error:', error);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('LoginPage: auth state changed:', { isAuthenticated, isLoading, error });
    if (isAuthenticated) {
      console.log('LoginPage: authenticated, navigating to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginPage: submitting login form...');
    
    try {
      console.log('LoginPage: dispatching loginAdmin...');
      const result = await dispatch(loginAdmin(formData)).unwrap();
      console.log('LoginPage: login successful:', result);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      console.error('LoginPage: login failed:', error);
      // Error is already handled by the Redux slice
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">TF</span>
            </div>
          </div>
          <Typography variant="heading-xl" className="text-foreground">
            Taskflow Admin
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            Sign in to your admin account
          </Typography>
        </div>

        {/* Login Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Typography variant="body-small" className="text-red-600 dark:text-red-400">
                    {error}
                  </Typography>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Typography variant="body-small" className="text-muted-foreground">
                Forgot your password?{' '}
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>

        {/* Debug Section */}
        <div className="text-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== LOCALSTORAGE DEBUG ===');
              console.log('adminToken:', localStorage.getItem('adminToken'));
              console.log('All localStorage keys:', Object.keys(localStorage));
              console.log('localStorage length:', localStorage.length);
              console.log('All localStorage entries:', Object.entries(localStorage));
              console.log('=======================');
            }}
          >
            Debug localStorage
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== AUTH STATE DEBUG ===');
              console.log('Redux auth state:', { isAuthenticated, isLoading, error });
              console.log('localStorage adminToken exists:', !!localStorage.getItem('adminToken'));
              console.log('localStorage adminToken value:', localStorage.getItem('adminToken'));
              console.log('=======================');
            }}
          >
            Debug Auth State
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== TOKEN VALIDATION TEST ===');
              const token = localStorage.getItem('adminToken');
              if (token) {
                console.log('Testing token format...');
                console.log('Token length:', token.length);
                console.log('Token starts with:', token.substring(0, 20));
                console.log('Token ends with:', token.substring(token.length - 20));
                console.log('Token contains "Bearer":', token.includes('Bearer'));
                console.log('Token looks like JWT:', /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token));
              } else {
                console.log('No token found in localStorage');
              }
              console.log('=======================');
            }}
          >
            Test Token Format
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              console.log('=== TEST LOGIN FLOW ===');
              console.log('Testing with sample credentials...');
              
              const testCredentials = {
                email: 'admin@example.com',
                password: 'admin123'
              };
              
              console.log('Test credentials:', testCredentials);
              console.log('localStorage before login:', localStorage.getItem('adminToken'));
              
              try {
                console.log('Dispatching loginAdmin...');
                const result = await dispatch(loginAdmin(testCredentials)).unwrap();
                console.log('Test login result:', result);
                console.log('localStorage after test login:', localStorage.getItem('adminToken'));
                
                // Test the token format
                const token = localStorage.getItem('adminToken');
                if (token) {
                  console.log('Token analysis:');
                  console.log('- Length:', token.length);
                  console.log('- Type:', typeof token);
                  console.log('- Starts with:', token.substring(0, 20));
                  console.log('- Ends with:', token.substring(token.length - 20));
                  console.log('- Contains "null":', token.includes('null'));
                  console.log('- Contains "undefined":', token.includes('undefined'));
                  console.log('- Looks like JWT:', /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token));
                } else {
                  console.log('No token found in localStorage after login');
                }
              } catch (error) {
                console.error('Test login failed:', error);
              }
              
              console.log('=======================');
            }}
          >
            Test Login Flow
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Typography variant="body-small" className="text-muted-foreground">
            TaskFlow Admin Panel • Secure Access
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
