import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Download, ArrowRight, CreditCard } from 'lucide-react';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Typography,
  Alert,
  Badge
} from '@taskflow/ui';

interface PaymentDetails {
  sessionId: string | null;
  amount: string | null;
  planName: string | null;
  transactionId: string | null;
  paymentMethod: string | null;
}

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract payment details from URL params
  const paymentDetails: PaymentDetails = {
    sessionId: searchParams.get('session_id'),
    amount: searchParams.get('amount'),
    planName: searchParams.get('plan'),
    transactionId: searchParams.get('transaction_id'),
    paymentMethod: searchParams.get('payment_method')
  };

  useEffect(() => {
    // Log successful payment for analytics
    console.log('Payment successful:', paymentDetails);
    
    // You could also trigger any post-payment actions here
    // like updating user subscription status, sending confirmation emails, etc.
  }, [paymentDetails]);

  const handleGoToDashboard = (): void => {
    navigate('/workspace');
  };

  const handleDownloadReceipt = (): void => {
    // In a real app, this would download or open the receipt
    console.log('Download receipt for transaction:', paymentDetails.transactionId);
    // You could implement actual receipt download logic here
  };

  const handleViewBilling = (): void => {
    navigate('/workspace/billing');
  };

  const formatAmount = (amount: string | null): string => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPlanBadgeVariant = (planName: string | null): 'default' | 'success' | 'warning' | 'destructive' => {
    switch (planName?.toLowerCase()) {
      case 'pro':
      case 'premium':
        return 'success';
      case 'enterprise':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Container size="md">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
          </div>

          {/* Main Card */}
          <Card variant="elevated" className="text-center">
            <CardHeader className="pb-4">
              <Typography variant="h2" className="text-foreground mb-2">
                Payment Successful!
              </Typography>
              <Typography variant="body-large" textColor="muted">
                Thank you for your purchase. Your payment has been processed successfully.
              </Typography>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success Alert */}
              <Alert
                variant="success"
                title="Payment Confirmed"
                description="Your subscription has been activated and you now have access to all premium features."
                showCloseButton={false}
              />

              {/* Payment Details */}
              {(paymentDetails.amount || paymentDetails.planName) && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <Typography variant="small" textColor="muted" className="uppercase tracking-wide">
                    Payment Summary
                  </Typography>
                  
                  {paymentDetails.planName && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Plan:</Typography>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPlanBadgeVariant(paymentDetails.planName)}>
                          {paymentDetails.planName}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {paymentDetails.amount && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Amount Paid:</Typography>
                      <Typography variant="body-medium" className="font-semibold text-success">
                        {formatAmount(paymentDetails.amount)}
                      </Typography>
                    </div>
                  )}
                  
                  {paymentDetails.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Payment Method:</Typography>
                      <Typography variant="body-medium" className="font-semibold">
                        {paymentDetails.paymentMethod}
                      </Typography>
                    </div>
                  )}
                  
                  {paymentDetails.transactionId && (
                    <div className="flex justify-between items-center">
                      <Typography variant="body-medium">Transaction ID:</Typography>
                      <Typography variant="caption" className="font-mono">
                        {paymentDetails.transactionId.substring(0, 16)}...
                      </Typography>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Typography variant="body-medium">Date:</Typography>
                    <Typography variant="body-medium">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                <Typography variant="body-small" textColor="muted">
                  <strong>What's Next?</strong> You can now access all premium features from your dashboard. 
                  A confirmation email with your receipt has been sent to your registered email address.
                </Typography>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              {paymentDetails.transactionId && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownloadReceipt}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="lg"
                onClick={handleViewBilling}
                className="w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Billing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Additional Information */}
          <div className="text-center space-y-2">
            <Typography variant="body-small" textColor="muted">
              Questions about your subscription? Contact our support team
            </Typography>
            <div className="flex justify-center gap-4">
              <Button variant="link" size="sm">
                support@taskflow.com
              </Button>
              <Button variant="link" size="sm">
                Help Center
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Success;
