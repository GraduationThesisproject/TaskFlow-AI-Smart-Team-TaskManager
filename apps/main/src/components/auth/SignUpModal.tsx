import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '@taskflow/ui';
import { Button } from '@taskflow/ui';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignIn,
}) => {
  const { register, signupWithOAuth, isLoading, error, clearAuthError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
      setTouched({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsOAuthLoading(false);
      clearAuthError();
    }
  }, [isOpen, clearAuthError]);

  // Close modal when user becomes authenticated (for OAuth)
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'fullName':
        if (!value) {
          error = 'Full name is required';
        } else if (value.length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Get or generate device ID and info
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }
      
      const deviceInfo = {
        type: 'web' as const,
        os: navigator.platform || 'Unknown',
        browser: navigator.userAgent.split(' ').pop() || 'Unknown'
      };

      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        device: {
          deviceId,
          deviceInfo
        }
      };

      const result = await register(userData);
      
      // Only close modal if registration was successful
      if (result.type === 'auth/register/fulfilled') {
        onClose();
      }
      // If registration failed, the error will be displayed via the error state
    } catch (error) {
      // Error is handled by the auth hook
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    try {
      setIsOAuthLoading(true);
      await signupWithOAuth(provider);
      // OAuth redirects to provider, so we don't close modal here
      // The modal will be closed when user returns from OAuth callback
    } catch (error) {
      // Error is handled by the auth hook
      setIsOAuthLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isAnyLoading = isLoading || isOAuthLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      padding="none"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="relative bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
        <div className="relative z-10">
          {/* Header */}
          <div className="px-5 pt-4 pb-2 text-center border-b border-slate-200 dark:border-slate-700">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mb-1.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Create your account</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">Join thousands of users</p>
          </div>

          {/* Form */}
          <div className="px-5 py-3">
            {error && (
              <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className={`w-full pl-7 pr-2.5 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.fullName ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                </div>
                {errors.fullName && touched.fullName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-7 pr-2.5 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`w-full pl-7 pr-7 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  >
                    <svg className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full pl-7 pr-7 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  >
                    <svg className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 rounded-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-2.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-1.5">
              <Button
                type="button"
                onClick={() => handleOAuthSignup('google')}
                disabled={isAnyLoading}
                className="w-full py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-slate-600"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </div>
              </Button>

              <Button
                type="button"
                onClick={() => handleOAuthSignup('github')}
                disabled={isAnyLoading}
                className="w-full py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-slate-600"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </div>
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="mt-2 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};