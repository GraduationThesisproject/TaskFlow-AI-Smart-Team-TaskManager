import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";

import HeroSection from '../../../components/common/HeroSection';
import CTASection from '../../../components/common/CTASection';
import { 
  Check,
  X,
  Star
} from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      price: { monthly: 9, yearly: 7 },
      features: [
        "Up to 5 team members",
        "Basic task management",
        "Simple project boards",
        "Email support",
        "Basic integrations",
        "Mobile app access"
      ],
      limitations: [
        "No AI features",
        "Limited analytics",
        "Basic reporting",
        "No advanced permissions"
      ],
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
      popular: false
    },
    {
      name: "Professional",
      description: "Ideal for growing teams and businesses",
      price: { monthly: 29, yearly: 23 },
      features: [
        "Up to 25 team members",
        "AI-powered task prioritization",
        "Advanced project boards",
        "Real-time collaboration",
        "Priority support",
        "Advanced integrations",
        "Custom workflows",
        "Time tracking",
        "Performance analytics",
        "Team chat"
      ],
      limitations: [
        "Limited AI insights",
        "Basic compliance features"
      ],
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      price: { monthly: 99, yearly: 79 },
      features: [
        "Unlimited team members",
        "Full AI suite & automation",
        "Advanced analytics & reporting",
        "Enterprise security & compliance",
        "Custom integrations & API",
        "Dedicated support manager",
        "Advanced permissions & SSO",
        "Custom branding",
        "Advanced workflows",
        "Predictive analytics",
        "Risk assessment",
        "Global compliance",
        "White-label options"
      ],
      limitations: [],
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      popular: false
    }
  ];

  const features = [
    {
      name: "Team Members",
      starter: "5",
      professional: "25",
      enterprise: "Unlimited"
    },
    {
      name: "AI Features",
      starter: <X className="w-5 h-5 text-red-500" />,
      professional: <Check className="w-5 h-5 text-green-500" />,
      enterprise: <Check className="w-5 h-5 text-green-500" />
    },
    {
      name: "Project Boards",
      starter: "Basic",
      professional: "Advanced",
      enterprise: "Unlimited"
    },
    {
      name: "Analytics",
      starter: "Basic",
      professional: "Advanced",
      enterprise: "Enterprise"
    },
    {
      name: "Integrations",
      starter: "5",
      professional: "25+",
      enterprise: "Unlimited"
    },
    {
      name: "Support",
      starter: "Email",
      professional: "Priority",
      enterprise: "Dedicated"
    },
    {
      name: "Security",
      starter: "Standard",
      professional: "Advanced",
      enterprise: "Enterprise"
    },
    {
      name: "Compliance",
      starter: <X className="w-5 h-5 text-red-500" />,
      professional: "Basic",
      enterprise: "Full Suite"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
            
      <HeroSection
        title="Simple, Transparent"
        subtitle="Pricing"
        description="Choose the perfect plan for your team. Start free, scale as you grow, and only pay for what you need."
      />

      {/* Billing Toggle */}
      <section className="py-8">
        <Container size="4xl">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`}></div>
            </button>
            <span className={`text-lg font-medium ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </Container>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className={`relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Typography variant="h3" className="text-2xl font-bold mb-2 text-slate-900">
                      {plan.name}
                    </Typography>
                    <Typography variant="body" className="text-slate-600 mb-6">
                      {plan.description}
                    </Typography>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-slate-900">
                        ${plan.price[billingCycle]}
                      </span>
                      <span className="text-slate-600">/user/month</span>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className={`w-full py-3 font-semibold ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-200'
                      } transition-all duration-300 transform hover:-translate-y-1`}
                      asChild
                    >
                      <Link to="/signup">
                        {plan.popular ? 'Start Free Trial' : 'Get Started'}
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <Typography variant="body-medium" className="font-semibold text-slate-900 mb-4">
                      What's included:
                    </Typography>
                    
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <Typography variant="body" className="text-slate-700">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <Typography variant="body-medium" className="font-semibold text-slate-900 mt-6 mb-4">
                          Limitations:
                        </Typography>
                        
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <div key={limitationIndex} className="flex items-center space-x-3">
                            <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <Typography variant="body" className="text-slate-500">
                              {limitation}
                            </Typography>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
        <Container size="6xl">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Compare Plans
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              See exactly what each plan offers and choose the right one for your team
            </Typography>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-4 px-6 font-medium text-slate-700">{feature.name}</td>
                    <td className="py-4 px-6 text-center">{feature.starter}</td>
                    <td className="py-4 px-6 text-center">{feature.professional}</td>
                    <td className="py-4 px-6 text-center">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <Container size="4xl">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Frequently Asked Questions
            </Typography>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  Can I change plans anytime?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </div>
              
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  Is there a free trial?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  Absolutely! All plans come with a 14-day free trial. No credit card required to start.
                </Typography>
              </div>
              
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  What payment methods do you accept?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
                </Typography>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  Do you offer discounts for nonprofits?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  Yes! We offer special pricing for nonprofits and educational institutions. Contact us for details.
                </Typography>
              </div>
              
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  Can I cancel anytime?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  Of course! You can cancel your subscription at any time with no cancellation fees.
                </Typography>
              </div>
              
              <div>
                <Typography variant="h4" className="text-xl font-semibold mb-3 text-slate-900">
                  Is my data secure?
                </Typography>
                <Typography variant="body" className="text-slate-600">
                  Yes! We use bank-level encryption and are SOC 2 compliant. Your data is always safe with us.
                </Typography>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection
        title="Ready to Get Started?"
        description="Join thousands of teams who've already transformed their workflow with TaskFlow"
        primaryButton={{
          text: "Start Free Trial",
          onClick: () => console.log("Start Free Trial clicked - handled by parent")
        }}
        secondaryButton={{
          text: "Contact Sales",
          onClick: () => console.log("Contact sales clicked")
        }}
        showTrustText={true}
      />
    </div>
  );
};

export default Pricing;
