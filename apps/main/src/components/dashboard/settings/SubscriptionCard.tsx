import React, { useState } from 'react';
import { Card, CardContent, Button, Typography, Badge, Gradient } from '@taskflow/ui';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../../hooks/useAuth';

const SubscriptionCard: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const { user, token } = useAuth();

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
      desc: "For individuals or small teams looking to keep work organized.",
      cta: "Current",
      ctaVariant: "secondary" as const,
      highlighted: false,
    },
    {
      key: "standard",
      name: "Standard",
      monthlyPrice: 5,
      desc: "Get more done with unlimited boards, card mirroring, and more automation.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: false,
    },
    {
      key: "premium",
      name: "Premium",
      monthlyPrice: 10,
      desc: "Add AI to your boards and admin controls to your toolkit. Plus, get more perspective with views.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: true,
    },
    {
      key: "enterprise",
      name: "Enterprise",
      monthlyPrice: 17.5,
      desc: "Add enterprise‑grade security and controls to your toolkit.",
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

  const tableRows = [
    {
      section: "BASICS",
      items: [
        {
          label: "Unlimited cards",
          values: [true, true, true, true],
        },
        {
          label: "Boards per Workspace",
          values: ["Up to 10", "∞", "∞", "∞"],
        },
        {
          label: "Storage",
          values: ["10MB/file", "250MB/file", "250MB/file", "∞"],
        },
      ],
    },
    {
      section: "AUTOMATION",
      items: [
        {
          label: "Workspace command runs",
          values: ["250/month", "1,000/month", "∞", "∞"],
        },
        {
          label: "Advanced checklists",
          values: ["—", true, true, true],
        },
      ],
    },
    {
      section: "VIEWS",
      items: [
        {
          label: "Calendar, Timeline, Table, Dashboard",
          values: ["—", "—", true, true],
        },
      ],
    },
  ];

  const makePayment = async (plan: any) => {
    const stripe = await loadStripe("pk_test_51S0u5XQnbFIuhN9UcRTwnxmcl37YLiKzz1dh5FjWjpMaU6Blw63t9wrnhtT7QFI7OkpgUIo4CgmZ0OPnDenCUZcg00ZZLPzodR");

    const price = calculatePrice(plan.monthlyPrice);
    const priceInCents = Math.round(price * 100);

    const body = {
      products: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan.name} Plan`,
            description: plan.desc,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      metadata: {
        plan: plan.name,
        billing_cycle: billingCycle,
        original_price: plan.monthlyPrice,
        final_price: price,
      }
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`/api/checkout/create-checkout-session`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const session = await response.json();

      const result = await stripe?.redirectToCheckout({
        sessionId: session.id
      });

      if (result?.error) {
        console.error(result.error.message);
      }

    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const handlePlanAction = (plan: any) => {
    if (plan.key === "free") return;
    
    if (plan.cta === "Contact Sales") {
      window.open("mailto:sales@taskflow.com?subject=Enterprise Plan Inquiry", "_blank");
    } else {
      makePayment(plan);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex flex-col">
          <Typography variant="h1" className="text-3xl font-bold text-foreground">
            Upgrade account
          </Typography>
          <div className="mt-2 flex items-center gap-2">
            <Typography variant="caption" className="text-muted-foreground">
              Billing:
            </Typography>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl bg-muted border border-border p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-4 font-semibold ${
                    billingCycle === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setBillingCycle("annually")}
                  className={`rounded-full px-4 font-semibold ${
                    billingCycle === "annually"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Annually
                </Button>
              </div>
              <Badge variant="accent" className="ml-1">Save 17%</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <Card className="bg-muted/30 rounded-xl border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
          {plans.map((p) => (
            <div key={p.key} className="rounded-md overflow-hidden">
              {p.highlighted ? (
                <Gradient
                  variant="primary"
                  direction="to-r"
                  className="rounded-md"
                >
                  <Card className="bg-transparent border-none shadow-none">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                      <div className="flex items-center justify-center w-full">
                        <Typography variant="h3" textColor="white" className="font-bold">
                          {p.name}
                        </Typography>
                      </div>
                      <div className="mt-3">
                        <Typography variant="large" textColor="white" className="text-2xl font-extrabold">
                          {p.price}
                        </Typography>
                        <Typography variant="caption" textColor="white" className="opacity-90">
                          {p.period}
                        </Typography>
                        {p.annualSavings && (
                          <Typography variant="caption" textColor="white" className="block mt-1 text-green-300">
                            {p.annualSavings}
                          </Typography>
                        )}
                      </div>
                      <Typography variant="caption" textColor="white" className="mt-3 block">
                        {p.desc}
                      </Typography>
                      {p.key !== "free" && (
                        <Button 
                          size="sm" 
                          className="mt-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handlePlanAction(p)}
                        >
                          {p.cta}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Gradient>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    <div className="flex items-center justify-center w-full gap-2">
                      <Typography variant="h3" className="font-bold text-foreground">
                        {p.name}
                      </Typography>
                      {p.isCurrent && (
                        <Badge className="rounded-md bg-accent text-accent-foreground" variant="secondary">Current</Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <Typography variant="large" className="text-2xl font-extrabold text-foreground">
                        {p.price}
                      </Typography>
                      {p.period && (
                        <Typography variant="caption" className="text-muted-foreground">
                          {p.period}
                        </Typography>
                      )}
                      {p.annualSavings && (
                        <Typography variant="caption" className="block mt-1 text-green-600 dark:text-green-400">
                          {p.annualSavings}
                        </Typography>
                      )}
                    </div>
                    <Typography variant="caption" className="mt-3 block text-muted-foreground">
                      {p.desc}
                    </Typography>
                    {p.key !== "free" && (
                      <Button
                        size="sm"
                        variant={p.key === "enterprise" ? "accent" : "default"}
                        className="mt-4 rounded-md"
                        onClick={() => handlePlanAction(p)}
                      >
                        {p.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Features comparison */}
      <Card className="overflow-hidden rounded-md border border-border">
        <div className="bg-muted/30">
          {/* Header row: FEATURES + Plan names */}
          <div className="grid grid-cols-5 text-xs md:text-sm">
            <div className="col-span-2 p-4 border-b border-border">
              <span className="text-accent-foreground font-semibold tracking-wide">FEATURES</span>
            </div>
            {plans.map((p) => (
              <div key={p.key} className="p-4 border-b border-border text-center text-foreground font-semibold">
                {p.name}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-muted/30 rounded-b-md">
          {tableRows.map((group) => (
            <div key={group.section}>
              {/* Section label row */}
              <div className="px-4 py-2 text-[11px] tracking-wide text-accent-foreground border-t border-border">
                {group.section}
              </div>
              {/* Feature rows */}
              {group.items.map((row) => (
                <div key={row.label} className="grid grid-cols-5 items-center border-t border-border">
                  <div className="col-span-2 p-4 text-muted-foreground">{row.label}</div>
                  {row.values.map((v, idx) => (
                    <div key={idx} className="p-4 text-center">
                      {typeof v === "boolean" ? (
                        v ? (
                          <span className="text-accent text-lg leading-none">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : v === "∞" ? (
                        <span className="text-accent">{v}</span>
                      ) : v === "—" ? (
                        <span className="text-muted-foreground">{v}</span>
                      ) : (
                        <span className="text-muted-foreground">{v}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
