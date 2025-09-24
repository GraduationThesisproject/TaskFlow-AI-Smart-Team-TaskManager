import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService } from '@/services/subscriptionService';

const SubscriptionCard: React.FC = () => {
  const colors = useThemeColors();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Get user's current plan from subscription data
  const getCurrentUserPlan = (): string => {
    if (user?.subscription?.plan && user.subscription.status === 'active') {
      return user.subscription.plan.toLowerCase();
    }
    return 'free'; // Default to free if no active subscription
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

  const PlanCard: React.FC<{ plan: any }> = ({ plan }) => {
    const isHighlighted = plan.highlighted;
    const isCurrent = plan.isCurrent;

    return (
      <TouchableOpacity
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
            TextStyles.heading.h3,
            { color: isHighlighted ? colors.onPrimary : colors.foreground }
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
              <Text style={[TextStyles.body.small, { color: colors.onAccent }]}>
                Current
              </Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={{ marginBottom: 8 }}>
          <Text style={[
            TextStyles.heading.h1,
            { 
              color: isHighlighted ? colors.onPrimary : colors.foreground,
              fontSize: 28,
              fontWeight: 'bold'
            }
          ]}>
            {plan.price}
          </Text>
          {plan.period && (
            <Text style={[
              TextStyles.body.small,
              { color: isHighlighted ? colors.onPrimary : colors['muted-foreground'], opacity: 0.8 }
            ]}>
              {plan.period}
            </Text>
          )}
          {plan.annualSavings && (
            <Text style={[
              TextStyles.body.small,
              { color: isHighlighted ? '#4ade80' : colors.success }
            ]}>
              {plan.annualSavings}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={[
          TextStyles.body.medium,
          { 
            color: isHighlighted ? colors.onPrimary : colors['muted-foreground'],
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
                TextStyles.body.medium,
                { color: isHighlighted ? colors.primary : colors.onPrimary, fontWeight: '600' }
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Upgrade account
        </Text>
        <View style={styles.billingToggle}>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Billing:
          </Text>
          <View style={[styles.toggleContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: billingCycle === "monthly" ? colors.primary : 'transparent',
                }
              ]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text style={[
                TextStyles.body.small,
                { 
                  color: billingCycle === "monthly" ? colors['primary-foreground'] : colors['muted-foreground'],
                  fontWeight: '600'
                }
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: billingCycle === "annually" ? colors.primary : 'transparent',
                }
              ]}
              onPress={() => setBillingCycle("annually")}
            >
              <Text style={[
                TextStyles.body.small,
                { 
                  color: billingCycle === "annually" ? colors['primary-foreground'] : colors['muted-foreground'],
                  fontWeight: '600'
                }
              ]}>
                Annually
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.savingsBadge, { backgroundColor: colors.accent }]}>
            <Text style={[TextStyles.body.small, { color: colors.onAccent }]}>
              Save 17%
            </Text>
          </View>
        </View>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {enhancedPlans.map((plan) => (
          <PlanCard key={plan.key} plan={plan} />
        ))}
      </View>

      {/* Features Comparison */}
      <View style={styles.featuresContainer}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
          Features Comparison
        </Text>
        
        <View style={[styles.featuresTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header Row */}
          <View style={[styles.tableHeader, { backgroundColor: colors.muted }]}>
            <View style={{ flex: 2 }}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], fontWeight: '600' }]}>
                FEATURES
              </Text>
            </View>
            {enhancedPlans.map((plan) => (
              <View key={plan.key} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[TextStyles.body.small, { color: colors.foreground, fontWeight: '600' }]}>
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
              style={[styles.tableRow, { borderTopColor: colors.border }]}
            >
              <View style={{ flex: 2 }}>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  {feature.label}
                </Text>
              </View>
              {feature.values.map((value, valueIndex) => (
                <View key={valueIndex} style={{ flex: 1, alignItems: 'center' }}>
                  {typeof value === 'boolean' ? (
                    value ? (
                      <Text style={[TextStyles.body.medium, { color: colors.accent, fontSize: 18 }]}>✓</Text>
                    ) : (
                      <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>—</Text>
                    )
                  ) : value === '∞' ? (
                    <Text style={[TextStyles.body.medium, { color: colors.accent }]}>∞</Text>
                  ) : (
                    <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>{value}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center', lineHeight: 18 }]}>
          All plans include 14-day free trial. No credit card required to start.{'\n'}
          You can upgrade or downgrade your plan at any time.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  savingsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  plansContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featuresContainer: {
    padding: 16,
    paddingTop: 0,
  },
  featuresTable: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default SubscriptionCard;