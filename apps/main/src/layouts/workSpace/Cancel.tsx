import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Typography,
  Alert
} from '@taskflow/ui';

interface CancellationMessage {
  title: string;
  description: string;
  variant: 'error' | 'warning' | 'info';
}

const Cancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract payment details from URL params if available
  const sessionId = searchParams.get('session_id');
  const reason = searchParams.get('reason') || 'user_cancelled';
  const amount = searchParams.get('amount');
  const planName = searchParams.get('plan');

  useEffect(() => {
    // Log cancellation for analytics
    console.log('Payment cancelled:', { sessionId, reason, amount, planName });
  }, [sessionId, reason, amount, planName]);

  const handleRetryPayment = (): void => {
    // Navigate back to pricing or checkout page
    navigate('/workspace/pricing');
  };

  const handleGoHome = (): void => {
    navigate('/workspace');
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const getCancellationMessage = (): CancellationMessage => {
    switch (reason) {
      case 'payment_failed':
        return {
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please check your payment method and try again.',
          variant: 'error'
        };
      case 'session_expired':
        return {
          title: 'Session Expired',
          description: 'Your payment session has expired. Please start the checkout process again.',
          variant: 'warning'
        };
      case 'user_cancelled':
      default:
        return {
          title: 'Payment Cancelled',
          description: 'You have cancelled the payment process. No charges have been made to your account.',
          variant: 'info'
        };
    }
  };

  const messageConfig = getCancellationMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Container size="md">
        <div className="text-center space-y-6">
          {/* Main Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* Main Card */}
          <Card variant="elevated" className="text-center">
            <CardHeader className="pb-4">
              <Typography variant="h2" className="text-foreground mb-2">
                Payment Cancelled
              </Typography>
              <Typography variant="body-large" textColor="muted">
                Your payment was not completed
              </Typography>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Alert Message */}
              <Alert
                variant={messageConfig.variant}
                title={messageConfig.title}
                description={messageConfig.description}
                showCloseButton={false}
              />

              {/* Payment Details (if available) */}
              {(amount || planName) && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <Typography variant="small" textColor="muted" className="uppercase tracking-wide">
                    Payment Details
                  </Typography>
                  {planName && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Plan:</Typography>
                      <Typography variant="body-medium" className="font-semibold">
                        {planName}
                      </Typography>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Amount:</Typography>
                      <Typography variant="body-medium" className="font-semibold">
                        ${amount}
                      </Typography>
                    </div>
                  )}
                  {sessionId && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Session ID:</Typography>
                      <Typography variant="caption" className="font-mono">
                        {sessionId.substring(0, 16)}...
                      </Typography>
                    </div>
                  )}
                </div>
              )}

              {/* Information */}
              <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                <Typography variant="body-small" textColor="muted">
                  <strong>Don't worry!</strong> No charges have been made to your account. 
                  You can try again anytime or contact support if you need assistance.
                </Typography>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleRetryPayment}
                className="w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoHome}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={handleGoBack}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardFooter>
          </Card>

          {/* Support Information */}
          <div className="text-center space-y-2">
            <Typography variant="body-small" textColor="muted">
              Need help? Contact our support team
            </Typography>
            <div className="flex justify-center gap-4">
              <Button variant="link" size="sm">
                support@taskflow.com
              </Button>
              <Button variant="link" size="sm">
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Cancel;
