import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AuthCard,
  FormField,
  Button,
  SocialButton,
  Typography,
  Flex,
  Checkbox,
} from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { LoginCredentials } from "../../types/auth.types";

// Form validation errors interface
import type { FormErrors } from "../../types/interfaces/ui";

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearAuthError, loginWithOAuth } = useAuth();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<LoginCredentials>>({});

  // Add state to track OAuth login attempts
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [hasOAuthAttempted, setHasOAuthAttempted] = useState(false);

  // Clear form data when OAuth is attempted to prevent credential conflicts
  useEffect(() => {
    if (hasOAuthAttempted) {
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });
      setErrors({});
      setTouched({});
    }
  }, [hasOAuthAttempted]);

  // Clear errors when user starts typing
  const handleInputChange = (
    field: keyof LoginCredentials,
    value: string | boolean
  ) => {
    // Prevent input changes if OAuth was attempted
    if (hasOAuthAttempted) {
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user types
    if (errors[field as keyof FormErrors] && field !== "rememberMe") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation function
  const validateForm = (): boolean => {
    // Prevent validation if OAuth was attempted
    if (hasOAuthAttempted) {
      return false;
    }

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
    console.log("=== LOGIN FORM SUBMITTED ===");
    // Prevent form submission if OAuth is in progress or was attempted
    if (isOAuthLoading || hasOAuthAttempted) {
      return;
    }
    clearAuthError();
    setErrors({});
    console.log("=== LOGIN FORM ERRORS ===", errors);
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      console.log("=== LOGIN FORM DATA ===", formData);
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      if (result.meta.requestStatus === "fulfilled") {
        // toast.success("Login Successful!", "Welcome back to TaskFlow");
        // Navigate to dashboard or intended page
        navigate("/dashboard");
      } else if (result.meta.requestStatus === "rejected") {
        console.log("=== LOGIN RESULT REJECTED ===", result);
        const errorMessage = result.payload as string || "Login failed. Please check your credentials.";
        toast.error("Login Failed", errorMessage);
      }
    } catch (error) {
      toast.error("Login Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleBlur = (field: keyof LoginCredentials) => {
    // Prevent blur handling if OAuth was attempted
    if (hasOAuthAttempted) {
      return;
    }
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Check if field has error and is touched
  const hasError = (field: keyof FormErrors) =>
    touched[field as keyof LoginCredentials] && errors[field];

  // Handle OAuth login
  const handleOAuthLogin = async (provider: "google" | "github") => {
    // Prevent multiple OAuth attempts
    if (isOAuthLoading || isLoading || hasOAuthAttempted) {
      return;
    }

    try {
      setIsOAuthLoading(true);
      setHasOAuthAttempted(true);
      clearAuthError();
      setErrors({});

      // Clear form data immediately to prevent credential conflicts
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      toast.loading(`Connecting to ${provider}...`, "Please wait while we authenticate you");
      await loginWithOAuth(provider);
      toast.success(`Connected to ${provider}!`, "Authentication successful");
    } catch (error) {
      console.error(`OAuth login with ${provider} failed:`, error);
      toast.error(`OAuth Login Failed`, `Failed to connect with ${provider}. Please try again.`);
      // Reset OAuth state on failure to allow retry
      setHasOAuthAttempted(false);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  // Reset OAuth state when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setHasOAuthAttempted(false);
      setIsOAuthLoading(false);
    };
  }, []);

  // Combined loading state
  const isAnyLoading = isLoading || isOAuthLoading;

  return (
    <>
      <AuthCard
        title="TaskFlow"
        subtitle="Welcome Back"
        description="Sign in to continue managing your tasks efficiently"
        // fullHeight={false}
        // containerClassName="py-12 md:py-20"
      >
        {/* General Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Typography
              variant="body-small"
              className="text-destructive text-center"
            >
              {error}
            </Typography>
          </div>
        )}

        {/* OAuth in Progress Message */}
        {hasOAuthAttempted && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <Typography
              variant="body-small"
              className="text-primary text-center"
            >
              {isOAuthLoading
                ? "Connecting to GitHub..."
                : "GitHub authentication completed. Please wait..."}
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
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={hasError("email") ? errors.email : undefined}
            icon="email"
            disabled={isAnyLoading || hasOAuthAttempted}
            autoComplete="email"
          />

          {/* Password Field */}
          <FormField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            error={hasError("password") ? errors.password : undefined}
            icon="password"
            showPasswordToggle
            disabled={isAnyLoading || hasOAuthAttempted}
            autoComplete="current-password"
          />

          {/* Remember Me & Forgot Password */}
          <Flex justify="between" align="center" className="text-sm">
            <Checkbox
              checked={formData.rememberMe || false}
              onChange={(e) =>
                handleInputChange(
                  "rememberMe",
                  (e.target as HTMLInputElement).checked
                )
              }
              label="Remember me"
              disabled={isAnyLoading || hasOAuthAttempted}
            />
            <Button
              variant="link"
              size="sm"
              className="text-primary hover:text-primary/80 p-0 h-auto text-sm"
              disabled={isAnyLoading || hasOAuthAttempted}
              onClick={() => navigate("/forgot-password")}
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
            disabled={isAnyLoading || hasOAuthAttempted}
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
              disabled={isAnyLoading || hasOAuthAttempted}
              onClick={() => handleOAuthLogin("google")}
            >
              {isOAuthLoading ? "Connecting..." : "Google"}
            </SocialButton>
            <SocialButton
              provider="github"
              disabled={isAnyLoading || hasOAuthAttempted}
              onClick={() => handleOAuthLogin("github")}
            >
              {isOAuthLoading ? "Connecting..." : "GitHub"}
            </SocialButton>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Typography variant="body-small" className="text-muted-foreground">
              Don&apos;t have an account?{" "}
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
          <Typography
            variant="caption"
            className="text-muted-foreground text-center"
          >
            By continuing, you agree to our{" "}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
              disabled={isAnyLoading || hasOAuthAttempted}
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
              disabled={isAnyLoading || hasOAuthAttempted}
            >
              Privacy Policy
            </Button>
          </Typography>
        </div>
      </AuthCard>
    </>
  );
}
