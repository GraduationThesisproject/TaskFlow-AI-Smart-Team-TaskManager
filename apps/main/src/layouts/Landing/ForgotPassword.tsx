import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthCard, Button, Input, Typography } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !isValidEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignIn = () => {
    clearError();
    navigate('/signin');
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="TaskFlow"
        subtitle="Check Your Email"
        description="We've sent password reset instructions to your email address."
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-success" />
          </div>
          
          <div className="space-y-2">
            <Typography variant="body-medium" className="text-foreground">
              Password reset link sent to:
            </Typography>
            <Typography variant="body-medium" className="text-primary font-medium">
              {email}
            </Typography>
          </div>

          <div className="space-y-3">
            <Typography variant="body-small" className="text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
            
            <Button
              onClick={() => {
                setIsSuccess(false);
                setEmail("");
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Try Different Email
            </Button>
          </div>

          <Button
            onClick={handleBackToSignIn}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="TaskFlow"
      subtitle="Forgot Password?"
      description="Enter your email address and we'll send you a link to reset your password."
    >
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <Typography variant="body-small" className="text-destructive text-center">
            {error}
          </Typography>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Typography variant="body-medium" className="text-foreground font-medium mb-2">
            Email Address
          </Typography>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full"
            required
          />
          {email && !isValidEmail(email) && (
            <Typography variant="body-small" className="text-destructive mt-1">
              Please enter a valid email address
            </Typography>
          )}
        </div>

        <Button
          type="submit"
          disabled={!email || !isValidEmail(email) || isSubmitting}
          className="w-full"
          size="lg"
          variant="default"
        >
          {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>

        <div className="text-center">
          <Typography variant="body-small" className="text-muted-foreground mb-3">
            Remember your password?
          </Typography>
          <Button
            onClick={handleBackToSignIn}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
