import React, { useState } from 'react';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import CTASection from "../components/common/CTASection";
import { 
  Check, 
  Star,
  Zap,
  Users,
  Building,
  Crown,
  Shield,
  Globe,
  Clock,
  BarChart3,
  MessageSquare,
  FileText
} from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: "Starter",
      price: billingCycle === 'monthly' ? 9 : 90,
      description: "Perfect for small teams getting started",
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      features: [
        "Up to 5 team members",
        "Basic AI task prioritization",
        "Core collaboration tools",
        "5GB storage",
        "Email support",
        "Basic analytics"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: billingCycle === 'monthly' ? 29 : 290,
      description: "Ideal for growing teams and businesses",
      icon: Users,
      color: "from-purple-500 to-blue-600",
      features: [
        "Up to 25 team members",
        "Advanced AI features",
        "Advanced collaboration",
        "25GB storage",
        "Priority support",
        "Advanced analytics",
        "Custom workflows",
        "API access"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: billingCycle === 'monthly' ? 99 : 990,
      description: "For large organizations with advanced needs",
      icon: Building,
      color: "from-indigo-500 to-purple-600",
      features: [
        "Unlimited team members",
        "Full AI suite",
        "Enterprise collaboration",
        "Unlimited storage",
        "24/7 phone support",
        "Custom analytics",
        "Advanced security",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and advanced security features"
    },
    {
      icon: Globe,
      title: "Global Availability",
      description: "99.9% uptime guarantee with data centers worldwide"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock support for enterprise customers"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights and custom reporting capabilities"
    },
    {
      icon: MessageSquare,
      title: "Team Collaboration",
      description: "Real-time collaboration with advanced permission management"
    },
    {
      icon: FileText,
      title: "Custom Workflows",
      description: "Tailored workflows and automation for your specific needs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <Navbar />
      
      <HeroSection
        title="Simple, Transparent"
        subtitle="Pricing"
        description="Choose the perfect plan for your team. All plans include our core AI features and can be upgraded anytime."
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Contact Sales",
          onClick: () => console.log("Contact sales clicked")
        }}
      />

      {/* Billing Toggle */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
        <Container size="6xl">
          <div className="text-center">
            <div className="inline-flex items-center bg-white rounded-2xl p-2 shadow-lg border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Annual
                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing Plans */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className={`relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 ${
                  plan.popular 
                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl shadow-lg mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <Typography variant="h3" className="text-2xl font-bold mb-2 text-slate-900">
                      {plan.name}
                    </Typography>
                    <Typography variant="body" className="text-slate-600 mb-6">
                      {plan.description}
                    </Typography>
                    <div className="mb-6">
                      <Typography variant="h2" className="text-5xl font-bold text-slate-900">
                        ${plan.price}
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        {billingCycle === 'monthly' ? 'per month' : 'per year'}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <Typography variant="body" className="text-slate-700">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full py-3 font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Comparison */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              All Plans Include
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              Core features that make TaskFlow powerful for every team size
            </Typography>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-4 text-slate-900">
                  {feature.title}
                </Typography>
                <Typography variant="body" className="text-slate-600 leading-relaxed">
                  {feature.description}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Frequently Asked Questions
            </Typography>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-50 rounded-2xl p-8">
              <Typography variant="h4" className="text-xl font-semibold mb-4 text-slate-900">
                Can I change my plan anytime?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.
              </Typography>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              <Typography variant="h4" className="text-xl font-semibold mb-4 text-slate-900">
                Is there a free trial?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Absolutely! All plans come with a 14-day free trial. No credit card required to get started.
              </Typography>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              <Typography variant="h4" className="text-xl font-semibold mb-4 text-slate-900">
                What payment methods do you accept?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                We accept all major credit cards, PayPal, and bank transfers for annual enterprise plans.
              </Typography>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              <Typography variant="h4" className="text-xl font-semibold mb-4 text-slate-900">
                Do you offer discounts for nonprofits?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Yes! We offer special pricing for qualified nonprofits and educational institutions. Contact our sales team for details.
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      <CTASection
        title="Ready to Get Started?"
        description="Join thousands of teams who've already transformed their workflow with TaskFlow"
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Schedule Demo",
          onClick: () => console.log("Schedule demo clicked")
        }}
        showTrustText={true}
        trustText="No credit card required • 14-day free trial • Cancel anytime"
      />
    </div>
  );
};

export default Pricing;
