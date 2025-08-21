import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Checkbox, Typography, Flex } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from '@taskflow/theme';
import { Eye, EyeOff, Mail, Lock, Github } from "lucide-react";

// TypeScript interfaces
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
  rememberMe?: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearAuthError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<LoginFormData>>({});

  // Clear errors when component mounts or when Redux error changes
  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    }
  }, [error]);

  // Clear errors when user starts typing
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearAuthError();
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      // Check if login was successful
      if (result.meta.requestStatus === 'fulfilled') {
        // Navigate to dashboard or intended page
        navigate("/dashboard");
      } else if (result.meta.requestStatus === 'rejected') {
        // Error is already handled by Redux
        console.error("Login failed:", result.payload);
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Check if field has error and is touched
  const hasError = (field: keyof LoginFormData) => 
    touched[field] && errors[field];

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
        <div className="p-6">
          {/* Header with Logo */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg mb-2 shadow-lg">
              <Typography variant="h4" className="text-primary-foreground font-bold text-sm">
                T
              </Typography>
            </div>
            <Typography variant="h4" className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1">
              TaskFlow AI
            </Typography>
            <Typography variant="body-small" className="text-muted-foreground text-xs">
              Welcome back to your workspace
            </Typography>
          </div>

          {/* General Error Display */}
          {errors.general && (
            <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <Typography variant="body-small" className="text-destructive text-center text-xs">
                {errors.general}
              </Typography>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block">
                <Typography variant="body-small" className="text-foreground font-medium mb-1 text-xs">
                  Email Address
                </Typography>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`pl-8 h-9 text-sm ${hasError('email') ? 'border-destructive focus:border-destructive' : ''}`}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </label>
              {hasError('email') && (
                <Typography variant="body-small" className="text-destructive text-xs">
                  {errors.email}
                </Typography>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block">
                <Typography variant="body-small" className="text-foreground font-medium mb-1 text-xs">
                  Password
                </Typography>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-8 pr-8 h-9 text-sm ${hasError('password') ? 'border-destructive focus:border-destructive' : ''}`}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </label>
              {hasError('password') && (
                <Typography variant="body-small" className="text-destructive text-xs">
                  {errors.password}
                </Typography>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <Flex justify="between" align="center" className="text-xs">
              <Checkbox
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', (e.target as HTMLInputElement).checked)}
                label="Remember me"
                disabled={isLoading}
              />
              <Button
                variant="link"
                size="sm"
                className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </Flex>

            {/* Sign In Button */}
            <Button 
              type="submit" 
              variant="default" 
              size="sm" 
              className="w-full h-9"
              disabled={isLoading}
            >
              {isLoading ? (
                <Flex align="center" gap="sm">
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Signing In...</span>
                </Flex>
              ) : (
                <span className="text-sm">Sign In</span>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mr-1.5">
                  <path d="M18.8 10.2084C18.8 9.55837 18.7417 8.93337 18.6333 8.33337H10V11.8834H14.9333C14.7167 13.025 14.0667 13.9917 13.0917 14.6417V16.95H16.0667C17.8 15.35 18.8 13 18.8 10.2084Z" fill="currentColor"/>
                  <path d="M9.99974 19.1667C12.4747 19.1667 14.5497 18.35 16.0664 16.95L13.0914 14.6417C12.2747 15.1917 11.2331 15.525 9.99974 15.525C7.61641 15.525 5.59141 13.9167 4.86641 11.75H1.81641V14.1167C3.32474 17.1083 6.41641 19.1667 9.99974 19.1667Z" fill="currentColor"/>
                  <path d="M4.86634 11.7417C4.68301 11.1917 4.57467 10.6084 4.57467 10.0001C4.57467 9.39172 4.68301 8.80839 4.86634 8.25839V5.89172H1.81634C1.19134 7.12506 0.833008 8.51672 0.833008 10.0001C0.833008 11.4834 1.19134 12.8751 1.81634 14.1084L4.19134 12.2584L4.86634 11.7417Z" fill="currentColor"/>
                  <path d="M9.99974 4.48337C11.3497 4.48337 12.5497 4.95004 13.5081 5.85004L16.1331 3.22504C14.5414 1.74171 12.4747 0.833374 9.99974 0.833374C6.41641 0.833374 3.32474 2.89171 1.81641 5.89171L4.86641 8.25837C5.59141 6.09171 7.61641 4.48337 9.99974 4.48337Z" fill="currentColor"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                disabled={isLoading}
              >
                <Github className="h-4 w-4 mr-1.5" />
                Github
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-1">
              <Typography variant="body-small" className="text-muted-foreground text-xs">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="text-primary hover:text-primary/80 p-0 h-auto font-medium text-xs"
                  disabled={isLoading}
                >
                  Sign up
                </Button>
              </Typography>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-border">
            <Typography variant="body-small" className="text-muted-foreground text-center text-xs">
              By continuing, you agree to our{" "}
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                disabled={isLoading}
              >
                Terms of Service
              </Button>
              {" "}and{" "}
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                disabled={isLoading}
              >
                Privacy Policy
              </Button>
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
}

