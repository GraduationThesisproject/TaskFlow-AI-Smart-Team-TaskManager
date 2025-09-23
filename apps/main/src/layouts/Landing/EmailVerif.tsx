import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard, Button, Input, Typography } from "@taskflow/ui";
import { useAuth } from "../../hooks/useAuth";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationCode, error, clearAuthError } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get('email') || '';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Clear errors when component mounts
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    const code = verificationCode.join("");
    if (code.length === 6) {
      setIsVerifying(true);
      try {
        const result = await verifyEmail({ email, code });
        if (result.meta.requestStatus === 'fulfilled') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Email verification failed:", error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      await resendVerificationCode({ email });
      setResendCooldown(60); // 60 second cooldown
      setVerificationCode(["", "", "", "", "", ""]); // Clear current code
    } catch (error) {
      console.error("Resend verification code failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/');
  };

  return (
    <AuthCard
      title="TaskFlow"
      subtitle="Verify Your Email"
      description={`We've sent a 6-digit verification code to ${email || 'your email address'}. Please enter it below to complete your account setup.`}
    >
      {/* General Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <Typography variant="body-small" className="text-destructive text-center">
            {error}
          </Typography>
        </div>
      )}

      {/* Verification Code Label */}
      <div className="mb-4">
        <Typography variant="body-medium" className="text-foreground font-medium">
          Verification Code
        </Typography>
      </div>

      {/* Code Input Grid */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {verificationCode.map((digit, index) => (
          <Input
            key={index}
            id={`code-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 text-center text-lg font-medium"
            maxLength={1}
          />
        ))}
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerifyEmail}
        disabled={isVerifying || verificationCode.join("").length !== 6}
        className="w-full mb-6"
        size="lg"
        variant="default"
      >
        {isVerifying ? "Verifying..." : "Verify Email"}
      </Button>

      {/* Footer Links */}
      <div className="text-center">
        <Typography variant="body-small" className="text-muted-foreground mb-2">
          Don&apos;t receive the code?
        </Typography>
        <Button
          onClick={handleResendCode}
          disabled={isResending || resendCooldown > 0}
          variant="ghost"
          size="sm"
          className="text-accent hover:text-accent/90"
        >
          {isResending 
            ? "Sending..." 
            : resendCooldown > 0 
              ? `Resend in ${resendCooldown}s` 
              : "Resend Code"
          }
        </Button>
      </div>

      <div className="text-center mt-4">
        <Button
          onClick={handleBackToSignIn}
          variant="ghost"
          size="sm"
          className="text-accent hover:text-accent/90"
        >
          Back to Sign In
        </Button>
      </div>
    </AuthCard>
  );
}
