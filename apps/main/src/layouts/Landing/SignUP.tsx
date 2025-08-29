import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard, FormField, Button, SocialButton, Typography } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";
import type { RegisterData } from "../../types/auth.types";

// Form validation errors interface
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearAuthError, signupWithOAuth } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<RegisterData & { confirmPassword: string }>>({});

  // Clear errors when user starts typing
  const handleInputChange = (field: keyof (RegisterData & { confirmPassword: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const result = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      
      // Check if registration was successful
      if (result.meta.requestStatus === 'fulfilled') {
        // Navigate to dashboard or intended page
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is already handled by Redux through useAuth
    }
  };

  const handleBlur = (field: keyof (RegisterData & { confirmPassword: string })) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Check if field has error and is touched
  const hasError = (field: keyof FormErrors) => 
    touched[field] && errors[field];

  // Handle OAuth signup
  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    try {
      await signupWithOAuth(provider);
    } catch (error) {
      console.error(`OAuth signup with ${provider} failed:`, error);
    }
  };

  return (
    <div>
    <AuthCard
      title="TaskFlow"
      subtitle="Create Account"
      description="Join thousands of users managing their tasks efficiently"
      // fullHeight={false}
      // containerClassName="py-12 md:py-20"
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
        {/* Full Name Field */}
        <FormField
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={hasError('name') ? errors.name : undefined}
          icon="user"
          disabled={isLoading}
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        {/* Confirm Password Field */}
        <FormField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={hasError('confirmPassword') ? errors.confirmPassword : undefined}
          icon="password"
          showPasswordToggle
          disabled={isLoading}
          autoComplete="new-password"
        />

        {/* Create Account Button */}
        <Button 
          type="submit" 
          variant="gradient" 
          size="lg" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </span>
          ) : (
            "Create Account"
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
            onClick={() => handleOAuthSignup('google')}
          >
            Google
          </SocialButton>
          <SocialButton
            provider="github"
            disabled={isLoading}
            onClick={() => handleOAuthSignup('github')}
          >
            GitHub
          </SocialButton>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <Typography variant="body-small" className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary hover:text-primary/80 font-medium hover:underline"
            >
              Sign in here
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
    </div>
  );
}
