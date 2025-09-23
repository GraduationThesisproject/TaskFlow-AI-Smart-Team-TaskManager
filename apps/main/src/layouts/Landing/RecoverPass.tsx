import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { AuthCard, Button, Input, Typography } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error, resetPassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const passwordRequirements = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "One number", met: /\d/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async () => {
    if (!allRequirementsMet || !passwordsMatch) return;
    
    setIsResetting(true);
    try {
      await resetPassword({ token, email, newPassword });
      navigate('/?message=Password reset successful');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/');
  };

  return (
    <AuthCard
      title="TaskFlow"
      subtitle="Reset Password"
      description={`Enter your new password below to complete the password reset process${email ? ` for ${email}` : ''}.`}
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
      <div className="space-y-6">
        {/* New Password */}
        <div>
          <Typography variant="body-medium" className="text-foreground font-medium mb-2">
            New Password
          </Typography>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <Typography variant="body-medium" className="text-foreground font-medium mb-2">
            Confirm New Password
          </Typography>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Update Button */}
        <Button
          onClick={handleResetPassword}
          disabled={!allRequirementsMet || !passwordsMatch || isResetting}
          className="w-full"
          size="lg"
          variant="default"
        >
          {isResetting ? "Updating Password..." : "Update Password"}
        </Button>

        {/* Password Requirements */}
        <div className="space-y-3">
          <div className="text-center">
            <Typography variant="body-small" className="text-muted-foreground font-medium">
              Password Requirements
            </Typography>
          </div>
          <div className="space-y-2">
            {passwordRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check 
                  size={16} 
                  className={requirement.met ? "text-success" : "text-muted-foreground"} 
                />
                <Typography 
                  variant="body-small" 
                  className={requirement.met ? "text-success" : "text-muted-foreground"}
                >
                  {requirement.text}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Sign In */}
        <div className="text-center">
          <Button
            onClick={handleBackToSignIn}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            ← Back to Sign In
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
