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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
    
    try {
      await dispatch(loginAdmin(formData)).unwrap();
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      // Error is already handled by the Redux slice
      console.error('Login failed:', error);
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
                <button className="text-primary hover:underline">
                  Contact system administrator
                </button>
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
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
