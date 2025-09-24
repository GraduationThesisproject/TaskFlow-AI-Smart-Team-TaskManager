import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService, SubscriptionPlan } from '@/services/subscriptionService';

const { width } = Dimensions.get('window');

interface UpgradeScreenProps {
  onClose?: () => void;
}

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onClose }) => {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get user's current plan
  const getCurrentUserPlan = (): string => {
    if (user?.subscription?.plan && user.subscription.status === 'active') {
      return user.subscription.plan.toLowerCase();
    }
    return 'free';
  };

  const currentUserPlan = getCurrentUserPlan();
  const plans = SubscriptionService.getSubscriptionPlans(billingCycle);

  // Enhanced plans with calculated pricing
  const enhancedPlans = plans.map(plan => {
    const price = SubscriptionService.calculatePrice(plan.monthlyPrice, billingCycle);
    const period = SubscriptionService.getPeriodText(plan.key, billingCycle);
    const annualSavings = SubscriptionService.getAnnualSavings(plan.monthlyPrice, billingCycle);
    const isCurrent = plan.key === currentUserPlan;

    return {
      ...plan,
      price: SubscriptionService.formatPrice(price),
      period,
      annualSavings,
      isCurrent,
    };
  });

  const handlePlanAction = async (plan: any) => {
    if (plan.key === 'free') return;
    
    if (plan.cta === 'Contact Sales') {
      // Open email client for enterprise inquiries
      const emailUrl = `mailto:sales@taskflow.com?subject=Enterprise Plan Inquiry&body=Hello, I'm interested in learning more about the Enterprise plan for TaskFlow.`;
      try {
        await Linking.openURL(emailUrl);
      } catch (error) {
        Alert.alert('Error', 'Could not open email client');
      }
      return;
    }

    // Handle payment for standard/premium plans
    setIsProcessing(true);
    try {
      const paymentBody = SubscriptionService.generatePaymentBody(plan, billingCycle);
      const session = await SubscriptionService.createCheckoutSession(paymentBody);
      
      // Open Stripe checkout in browser
      await Linking.openURL(session.url);
      
    } catch (error: any) {
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const PlanCard: React.FC<{ plan: any; index: number }> = ({ plan, index }) => {
    const isHighlighted = plan.highlighted;
    const isCurrent = plan.isCurrent;

    return (
      <TouchableOpacity
        key={plan.key}
        style={{
          backgroundColor: isHighlighted ? colors.primary : colors.card,
          borderWidth: 1,
          borderColor: isHighlighted ? colors.primary : colors.border,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: isHighlighted ? colors.primary : colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isHighlighted ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: isHighlighted ? 6 : 2,
        }}
        onPress={() => handlePlanAction(plan)}
        disabled={plan.key === 'free' || isProcessing}
      >
        {/* Plan Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[
            TextStyles.h3,
            { color: isHighlighted ? colors.onPrimary : colors.onSurface }
          ]}>
            {plan.name}
          </Text>
          {isCurrent && (
            <View style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={[TextStyles.caption, { color: colors.onAccent }]}>
                Current
              </Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={{ marginBottom: 8 }}>
          <Text style={[
            TextStyles.display,
            { 
              color: isHighlighted ? colors.onPrimary : colors.onSurface,
              fontSize: 28,
              fontWeight: 'bold'
            }
          ]}>
            {plan.price}
          </Text>
          {plan.period && (
            <Text style={[
              TextStyles.caption,
              { color: isHighlighted ? colors.onPrimary : colors.onSurfaceVariant, opacity: 0.8 }
            ]}>
              {plan.period}
            </Text>
          )}
          {plan.annualSavings && (
            <Text style={[
              TextStyles.caption,
              { color: isHighlighted ? '#4ade80' : colors.success }
            ]}>
              {plan.annualSavings}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={[
          TextStyles.body,
          { 
            color: isHighlighted ? colors.onPrimary : colors.onSurfaceVariant,
            marginBottom: 16,
            lineHeight: 20
          }
        ]}>
          {plan.desc}
        </Text>

        {/* CTA Button */}
        {plan.key !== 'free' && (
          <TouchableOpacity
            style={{
              backgroundColor: isHighlighted ? colors.onPrimary : colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              opacity: isProcessing ? 0.6 : 1,
            }}
            onPress={() => handlePlanAction(plan)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={isHighlighted ? colors.primary : colors.onPrimary} />
            ) : (
              <Text style={[
                TextStyles.button,
                { color: isHighlighted ? colors.primary : colors.onPrimary }
              ]}>
                {plan.cta}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={onClose}>
          <FontAwesome name="times" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[TextStyles.h2, { color: colors.onSurface }]}>
          Upgrade Account
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Billing Cycle Toggle */}
        <View style={{ padding: 16 }}>
          <Text style={[TextStyles.body, { color: colors.onSurface, marginBottom: 12 }]}>
            Billing:
          </Text>
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: billingCycle === 'monthly' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[
                TextStyles.button,
                { 
                  color: billingCycle === 'monthly' ? colors.onPrimary : colors.onSurfaceVariant 
                }
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: billingCycle === 'annually' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setBillingCycle('annually')}
            >
              <Text style={[
                TextStyles.button,
                { 
                  color: billingCycle === 'annually' ? colors.onPrimary : colors.onSurfaceVariant 
                }
              ]}>
                Annually
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Savings Badge */}
          <View style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.accent,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            marginTop: 8,
          }}>
            <Text style={[TextStyles.caption, { color: colors.onAccent }]}>
              Save 17%
            </Text>
          </View>
        </View>

        {/* Plans */}
        <View style={{ paddingHorizontal: 16 }}>
          {enhancedPlans.map((plan, index) => (
            <PlanCard key={plan.key} plan={plan} index={index} />
          ))}
        </View>

        {/* Features Comparison */}
        <View style={{ padding: 16 }}>
          <Text style={[TextStyles.h3, { color: colors.onSurface, marginBottom: 16 }]}>
            Features Comparison
          </Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            {/* Header Row */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}>
              <View style={{ flex: 2 }}>
                <Text style={[TextStyles.caption, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>
                  FEATURES
                </Text>
              </View>
              {enhancedPlans.map((plan) => (
                <View key={plan.key} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[TextStyles.caption, { color: colors.onSurface, fontWeight: '600' }]}>
                    {plan.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Feature Rows */}
            {[
              { label: 'Boards per Workspace', values: ['Up to 10', '∞', '∞', '∞'] },
              { label: 'Storage', values: ['10MB/file', '250MB/file', '250MB/file', '∞'] },
              { label: 'Workspace command runs', values: ['250/month', '1,000/month', '∞', '∞'] },
              { label: 'Advanced checklists', values: [false, true, true, true] },
              { label: 'Calendar, Timeline, Table views', values: [false, false, true, true] },
            ].map((feature, featureIndex) => (
              <View
                key={featureIndex}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flex: 2 }}>
                  <Text style={[TextStyles.body, { color: colors.onSurfaceVariant }]}>
                    {feature.label}
                  </Text>
                </View>
                {feature.values.map((value, valueIndex) => (
                  <View key={valueIndex} style={{ flex: 1, alignItems: 'center' }}>
                    {typeof value === 'boolean' ? (
                      value ? (
                        <Text style={[TextStyles.body, { color: colors.accent, fontSize: 18 }]}>✓</Text>
                      ) : (
                        <Text style={[TextStyles.body, { color: colors.onSurfaceVariant }]}>—</Text>
                      )
                    ) : value === '∞' ? (
                      <Text style={[TextStyles.body, { color: colors.accent }]}>∞</Text>
                    ) : (
                      <Text style={[TextStyles.body, { color: colors.onSurfaceVariant }]}>{value}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={{ padding: 16, paddingBottom: 32 }}>
          <Text style={[TextStyles.caption, { color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 18 }]}>
            All plans include 14-day free trial. No credit card required to start.{'\n'}
            You can upgrade or downgrade your plan at any time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UpgradeScreen;
