import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SubscriptionCard: React.FC = () => {
  const colors = useThemeColors();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const { user } = useAuth();

  // Get user's current plan from subscription data
  const getCurrentUserPlan = (): string => {
    if (user?.subscription?.plan && user.subscription.status === 'active') {
      return user.subscription.plan.toLowerCase();
    }
    return 'free'; // Default to free if no active subscription
  };

  const currentUserPlan = getCurrentUserPlan();

  // Base monthly prices
  const basePlans = [
    {
      key: "free",
      name: "Free",
      monthlyPrice: 0,
      desc: "For individuals or small teams. Up to 5 spaces and 10 boards per workspace.",
      cta: "Current",
      ctaVariant: "secondary" as const,
      highlighted: false,
    },
    {
      key: "standard",
      name: "Standard",
      monthlyPrice: 5,
      desc: "Unlimited spaces and boards, advanced automation, and team collaboration tools.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: false,
    },
    {
      key: "premium",
      name: "Premium",
      monthlyPrice: 10,
      desc: "Advanced analytics, custom integrations, priority support, and all views.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: true,
    },
    {
      key: "enterprise",
      name: "Enterprise",
      monthlyPrice: 17.5,
      desc: "Enterprise-grade security, dedicated support, and unlimited everything.",
      cta: "Contact Sales",
      ctaVariant: "accent" as const,
      highlighted: false,
    },
  ];

  // Calculate dynamic pricing based on billing cycle
  const calculatePrice = (monthlyPrice: number) => {
    if (billingCycle === "annually") {
      const annualPrice = monthlyPrice * 12 * 0.83; // 17% discount
      return annualPrice;
    }
    return monthlyPrice;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "$0 USD";
    return `$${price.toFixed(2)} USD`;
  };

  const getPeriodText = (planKey: string) => {
    if (planKey === "free") return "";
    if (billingCycle === "monthly") {
      return "per user/month";
    } else {
      return "per user/year (billed annually)";
    }
  };

  // Generate plans with dynamic pricing
  const plans = basePlans.map(plan => ({
    ...plan,
    price: formatPrice(calculatePrice(plan.monthlyPrice)),
    period: getPeriodText(plan.key),
    annualSavings: billingCycle === "annually" && plan.monthlyPrice > 0 
      ? `Save $${(plan.monthlyPrice * 12 * 0.17).toFixed(2)}/year`
      : null,
    isCurrent: plan.key === currentUserPlan
  }));

  const handlePlanAction = (plan: any) => {
    if (plan.key === "free") return;
    
    if (plan.cta === "Contact Sales") {
      Alert.alert(
        'Contact Sales',
        'Please email sales@taskflow.com for enterprise plan inquiries.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Upgrade Plan',
        `Upgrade to ${plan.name} plan for ${plan.price} ${plan.period}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {
            // In a real implementation, this would integrate with payment processing
            Alert.alert('Payment', 'Payment integration would be implemented here');
          }}
        ]
      );
    }
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
            <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>
              Save 17%
            </Text>
          </View>
        </View>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <Card 
            key={plan.key} 
            style={[
              styles.planCard,
              {
                backgroundColor: plan.highlighted ? colors.primary : colors.card,
                borderColor: plan.highlighted ? colors.primary : colors.border,
              }
            ]}
          >
            <View style={styles.planHeader}>
              <Text style={[
                TextStyles.heading.h3,
                { 
                  color: plan.highlighted ? colors['primary-foreground'] : colors.foreground,
                  fontWeight: 'bold'
                }
              ]}>
                {plan.name}
              </Text>
              {plan.isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>
                    Current
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.planPricing}>
              <Text style={[
                TextStyles.heading.h2,
                { 
                  color: plan.highlighted ? colors['primary-foreground'] : colors.foreground,
                  fontWeight: 'bold'
                }
              ]}>
                {plan.price}
              </Text>
              {plan.period && (
                <Text style={[
                  TextStyles.caption.small,
                  { color: plan.highlighted ? colors['primary-foreground'] + 'CC' : colors['muted-foreground'] }
                ]}>
                  {plan.period}
                </Text>
              )}
              {plan.annualSavings && (
                <Text style={[
                  TextStyles.caption.small,
                  { color: plan.highlighted ? '#90EE90' : colors.success }
                ]}>
                  {plan.annualSavings}
                </Text>
              )}
            </View>
            
            <Text style={[
              TextStyles.body.small,
              { 
                color: plan.highlighted ? colors['primary-foreground'] + 'CC' : colors['muted-foreground'],
                textAlign: 'center',
                marginBottom: 16
              }
            ]}>
              {plan.desc}
            </Text>
            
            {plan.key !== "free" && (
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  {
                    backgroundColor: plan.highlighted 
                      ? colors['primary-foreground'] 
                      : plan.ctaVariant === 'accent' 
                        ? colors.accent 
                        : colors.primary,
                  }
                ]}
                onPress={() => handlePlanAction(plan)}
              >
                <Text style={[
                  TextStyles.body.medium,
                  { 
                    color: plan.highlighted 
                      ? colors.primary 
                      : colors['primary-foreground'],
                    fontWeight: '600'
                  }
                ]}>
                  {plan.cta}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}
      </View>

      {/* Features Comparison */}
      <Card style={styles.featuresCard}>
        <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600', marginBottom: 16 }]}>
          Features Comparison
        </Text>
        
        <View style={styles.featuresTable}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[TextStyles.body.small, { color: colors.foreground, fontWeight: '600', flex: 2 }]}>
              FEATURES
            </Text>
            {plans.map((plan) => (
              <Text key={plan.key} style={[TextStyles.body.small, { color: colors.foreground, fontWeight: '600', flex: 1, textAlign: 'center' }]}>
                {plan.name}
              </Text>
            ))}
          </View>
          
          {/* Features with sections */}
          {[
            // BASICS
            { section: "BASICS", items: [
              { label: "Unlimited cards", values: [true, true, true, true] },
              { label: "Boards per Workspace", values: ["Up to 10", "∞", "∞", "∞"] },
              { label: "Storage", values: ["10MB/file", "250MB/file", "250MB/file", "∞"] },
            ]},
            
            // WORKSPACE & SPACES
            { section: "WORKSPACE & SPACES", items: [
              { label: "Spaces per Workspace", values: ["Up to 5", "∞", "∞", "∞"] },
              { label: "Advanced space management", values: [false, true, true, true] },
              { label: "Team collaboration tools", values: ["Basic", true, true, true] },
              { label: "Advanced security features", values: [false, false, true, true] },
            ]},
            
            // AUTOMATION
            { section: "AUTOMATION", items: [
              { label: "Workspace command runs", values: ["250/month", "1,000/month", "∞", "∞"] },
              { label: "Advanced checklists", values: [false, true, true, true] },
            ]},
            
            // ANALYTICS & REPORTING
            { section: "ANALYTICS & REPORTING", items: [
              { label: "Basic analytics", values: [true, true, true, true] },
              { label: "Advanced analytics & reporting", values: [false, false, true, true] },
              { label: "Custom dashboards", values: [false, false, true, true] },
            ]},
            
            // INTEGRATIONS & API
            { section: "INTEGRATIONS & API", items: [
              { label: "Basic integrations", values: [true, true, true, true] },
              { label: "Custom integrations & API access", values: [false, false, true, true] },
              { label: "Webhook support", values: [false, false, true, true] },
            ]},
            
            // SUPPORT
            { section: "SUPPORT", items: [
              { label: "Community support", values: [true, true, true, true] },
              { label: "Email support", values: [false, true, true, true] },
              { label: "Priority support & faster response", values: [false, false, true, true] },
              { label: "Dedicated account manager", values: [false, false, false, true] },
            ]},
            
            // VIEWS
            { section: "VIEWS", items: [
              { label: "Calendar, Timeline, Table, Dashboard", values: [false, false, true, true] },
            ]},
          ].map((section, sectionIndex) => (
            <View key={sectionIndex}>
              {/* Section Header */}
              <View style={[styles.tableRow, styles.sectionHeader]}>
                <Text style={[TextStyles.caption.small, { color: colors.accent, fontWeight: '600', flex: 2 }]}>
                  {section.section}
                </Text>
                <View style={{ flex: 4 }} />
              </View>
              
              {/* Section Items */}
              {section.items.map((feature, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], flex: 2 }]}>
                    {feature.label}
                  </Text>
                  {feature.values.map((value, idx) => (
                    <View key={idx} style={styles.tableCell}>
                      {typeof value === "boolean" ? (
                        value ? (
                          <FontAwesome name="check" size={16} color={colors.accent} />
                        ) : (
                          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>—</Text>
                        )
                      ) : value === "∞" ? (
                        <Text style={[TextStyles.body.small, { color: colors.accent }]}>{value}</Text>
                      ) : (
                        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>{value}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  featuresCard: {
    padding: 20,
    borderRadius: 12,
  },
  featuresTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SubscriptionCard;
