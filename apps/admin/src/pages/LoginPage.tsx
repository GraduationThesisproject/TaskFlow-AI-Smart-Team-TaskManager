import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAdmin, clearError, complete2FALogin } from '../store/slices/adminSlice';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Typography } from '@taskflow/ui';
import { ThemeToggle } from '@taskflow/theme';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import TwoFactorAuthVerification from '../components/auth/TwoFactorAuthVerification';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.admin);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFAData, setTwoFAData] = useState<{
    userId: string;
    sessionId: string;
    message: string;
  } | null>(null);

  // Test localStorage functionality
  useEffect(() => {
    try {
      localStorage.setItem('test', 'test-value');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
    } catch (error) {
      // localStorage error handling
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
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
    
    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Form data:', formData);
    console.log('Form event:', e);
    
    try {
      console.log('Dispatching loginAdmin action...');
      const result = await dispatch(loginAdmin(formData)).unwrap();
      console.log('Login result:', result);
      console.log('Result data:', result.data);
      console.log('requires2FA:', result.data?.requires2FA);
      console.log('userId:', result.data?.userId);
      console.log('sessionId:', result.data?.sessionId);
      
      // Check if 2FA is required
      if (result.data?.requires2FA && result.data.userId && result.data.sessionId) {
        console.log('2FA required, setting state...');
        setRequires2FA(true);
        setTwoFAData({
          userId: result.data.userId,
          sessionId: result.data.sessionId,
          message: result.data.message || 'Two-factor authentication is required. Please enter your 6-digit code.'
        });
      } else {
        console.log('No 2FA required, result:', result);
      }
      // If no 2FA required, navigation will be handled by useEffect
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by the Redux slice
    }
  };

  const handle2FAVerification = async (token: string, rememberDevice: boolean = false) => {
    if (!twoFAData) return;
    
    console.log('=== 2FA VERIFICATION STARTED ===');
    console.log('Token:', token);
    console.log('Remember device:', rememberDevice);
    console.log('TwoFA data:', twoFAData);
    
    try {
      console.log('Dispatching complete2FALogin...');
      const result = await dispatch(complete2FALogin({
        userId: twoFAData.userId,
        token,
        sessionId: twoFAData.sessionId,
        rememberMe: false // You can add a remember me option if needed
      })).unwrap();
      
      console.log('2FA completion result:', result);
      
      // 2FA completed successfully, navigation will be handled by useEffect
      setRequires2FA(false);
      setTwoFAData(null);
      console.log('2FA state cleared, should redirect to dashboard');
    } catch (error: any) {
      console.error('2FA verification failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
    }
  };

  const handle2FACancel = () => {
    setRequires2FA(false);
    setTwoFAData(null);
    dispatch(clearError());
  };

  // Show 2FA verification screen if required
  if (requires2FA && twoFAData) {
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
              Two-Factor Authentication
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              {twoFAData.message}
            </Typography>
          </div>

          {/* 2FA Verification Component */}
          <TwoFactorAuthVerification
            userId={twoFAData.userId}
            onVerificationSuccess={() => {}} // Empty function since we don't use it
            onCancel={handle2FACancel}
            onVerify={handle2FAVerification}
          />

          {/* Theme Toggle */}
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

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
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-sm font-medium hover:underline cursor-pointer bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg border border-blue-300 transition-colors"
                onClick={() => {
                  alert('Forgot password functionality clicked!');
                  console.log('Admin forgot password button clicked');
                  // TODO: Navigate to forgot password page or show reset form
                }}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
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
