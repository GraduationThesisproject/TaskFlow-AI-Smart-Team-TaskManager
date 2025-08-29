import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

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
  const { user, updateUser } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  
  // Extract payment details from URL params
  const paymentDetails: PaymentDetails = {
    sessionId: searchParams.get('session_id'),
    amount: searchParams.get('amount'),
    planName: searchParams.get('plan'),
    transactionId: searchParams.get('transaction_id'),
    paymentMethod: searchParams.get('payment_method')
  };

  useEffect(() => {
    console.log("paymentDetails::::::::::::::::::::::::::::::::",paymentDetails)
    const processPaymentSuccess = async () => {
      if (!paymentDetails.sessionId || isProcessingUpgrade) return;
      
      setIsProcessingUpgrade(true);
      
      try {
        // Update user plan status
        if (paymentDetails.planName && user) {
          await updateUserPlan(paymentDetails.planName, paymentDetails.sessionId);
        }
        
        // Create success notification
        await createSuccessNotification();
        
        // Refresh notifications to show the new one
        fetchNotifications();
        
      } catch (error) {
        console.error('Error processing payment success:', error);
      } finally {
        setIsProcessingUpgrade(false);
      }
    };

    processPaymentSuccess();
  }, [paymentDetails.sessionId]);

  const updateUserPlan = async (planName: string, sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planName: planName.toLowerCase(),
          sessionId,
          upgradeDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update local user state
        if (updateUser) {
          updateUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  const createSuccessNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '🎉 Plan Upgrade Successful!',
          message: `Congratulations! You've successfully upgraded to the ${paymentDetails.planName} plan. All premium features are now available.`,
          type: 'success',
          category: 'billing',
          metadata: {
            planName: paymentDetails.planName,
            amount: paymentDetails.amount,
            sessionId: paymentDetails.sessionId
          }
        })
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

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
                description={`Your subscription has been activated and you now have access to all ${paymentDetails.planName || 'premium'} features.`}
                showCloseButton={false}
              />

              {/* Plan Upgrade Confirmation */}
              {paymentDetails.planName && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Typography variant="body-medium" className="font-semibold">
                      Plan Upgraded:
                    </Typography>
                    <Badge variant={getPlanBadgeVariant(paymentDetails.planName)}>
                      {paymentDetails.planName}
                    </Badge>
                  </div>
                  <Typography variant="body-small" textColor="muted">
                    Your account has been upgraded from <strong>Free</strong> to <strong>{paymentDetails.planName}</strong> plan.
                  </Typography>
                </div>
              )}

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
