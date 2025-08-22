import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard, FormField, Button, SocialButton, Typography, Flex, Checkbox } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";
import type { LoginCredentials } from "../../types/auth.types";
import AuthNavbar from "../../components/common/navbar/authNav/AuthNavbar";

// Form validation errors interface
interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearAuthError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<LoginCredentials>>({});

  // Clear errors when user starts typing
  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user types
    if (errors[field as keyof FormErrors] && field !== 'rememberMe') {
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
      }
    } catch (error) {
      // Error is already handled by Redux through useAuth
    }
  };

  const handleBlur = (field: keyof LoginCredentials) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Check if field has error and is touched
  const hasError = (field: keyof FormErrors) => 
    touched[field] && errors[field];

  return (
    <>
      <AuthNavbar />
      <AuthCard
        title="TaskFlow"
        subtitle="Welcome Back"
        description="Sign in to continue managing your tasks efficiently"
      >
      {/* General Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <Typography variant="body-small" className="text-destructive text-center">
            {error}
          </Typography>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <FormField
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={hasError('email') ? errors.email : undefined}
          icon="email"
          disabled={isLoading}
          autoComplete="email"
        />

        {/* Password Field */}
        <FormField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          error={hasError('password') ? errors.password : undefined}
          icon="password"
          showPasswordToggle
          disabled={isLoading}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <Flex justify="between" align="center" className="text-sm">
          <Checkbox
            checked={formData.rememberMe || false}
            onChange={(e) => handleInputChange('rememberMe', (e.target as HTMLInputElement).checked)}
            label="Remember me"
            disabled={isLoading}
          />
          <Button
            variant="link"
            size="sm"
            className="text-primary hover:text-primary/80 p-0 h-auto text-sm"
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        </Flex>

        {/* Sign In Button */}
        <Button 
          type="submit" 
          variant="gradient" 
          size="lg" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Flex align="center" gap="sm">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </Flex>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <SocialButton
            provider="google"
            disabled={isLoading}
          >
            Google
          </SocialButton>
          <SocialButton
            provider="github"
            disabled={isLoading}
          >
            GitHub
          </SocialButton>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <Typography variant="body-small" className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium hover:underline"
            >
              Sign up
            </Link>
          </Typography>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <Typography variant="caption" className="text-muted-foreground text-center">
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
    </AuthCard>
    </>
  );
}
