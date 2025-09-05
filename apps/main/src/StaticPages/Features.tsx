import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import CTASection from "../components/common/CTASection";
import { 
  Brain, 
  Users, 
  Zap, 
  Shield, 
  Target,
  BarChart3,
  Clock,
  MessageSquare,
  FileText,
  Globe,
  Lock,
  CheckCircle,
  Play
} from "lucide-react";

const Features = () => {
  const [activeCategory, setActiveCategory] = useState('ai');

  const categories = [
    { id: 'ai', label: 'AI & Automation', icon: Brain },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const features = {
    ai: [
      {
        icon: Brain,
        title: "AI Task Prioritization",
        description: "Intelligent algorithms analyze your team's patterns and automatically prioritize tasks based on urgency, dependencies, and team capacity.",
        benefits: ["40% faster project delivery", "Smart deadline management", "Automatic resource allocation"],
        color: "from-purple-500 to-blue-600"
      },
      {
        icon: Target,
        title: "Predictive Analytics",
        description: "Forecast project timelines, identify potential bottlenecks, and get insights into team performance trends.",
        benefits: ["Risk assessment", "Performance forecasting", "Capacity planning"],
        color: "from-blue-500 to-green-600"
      },
      {
        icon: Target,
        title: "Smart Workflow Automation",
        description: "Automate repetitive tasks, create intelligent workflows, and let AI handle routine project management.",
        benefits: ["Reduced manual work", "Consistent processes", "Error prevention"],
        color: "from-green-500 to-yellow-600"
      }
    ],
    collaboration: [
      {
        icon: Users,
        title: "Real-time Team Collaboration",
        description: "Work together seamlessly with live updates, instant messaging, and collaborative editing features.",
        benefits: ["Instant sync", "Team chat", "Shared workspaces"],
        color: "from-blue-500 to-purple-600"
      },
      {
        icon: MessageSquare,
        title: "Intelligent Notifications",
        description: "Smart notification system that learns your preferences and only alerts you when it matters.",
        benefits: ["Contextual alerts", "Priority-based notifications", "Smart filtering"],
        color: "from-purple-500 to-pink-600"
      },
      {
        icon: MessageSquare,
        title: "Advanced Sharing & Permissions",
        description: "Granular control over who can see and edit what, with enterprise-grade permission management.",
        benefits: ["Role-based access", "Secure sharing", "Audit trails"],
        color: "from-pink-500 to-red-600"
      }
    ],
    productivity: [
      {
        icon: Zap,
        title: "Lightning Fast Performance",
        description: "Built for speed with instant sync, offline capabilities, and performance that scales with your team.",
        benefits: ["Sub-second loading", "Offline mode", "Auto-sync"],
        color: "from-yellow-500 to-orange-600"
      },
      {
        icon: Clock,
        title: "Time Tracking & Management",
        description: "Comprehensive time tracking with AI-powered insights to optimize your team's productivity.",
        benefits: ["Automatic tracking", "Productivity insights", "Time optimization"],
        color: "from-orange-500 to-red-600"
      },
      {
        icon: Clock,
        title: "Smart Scheduling",
        description: "AI-powered calendar management that optimizes meeting times and resource allocation.",
        benefits: ["Smart scheduling", "Conflict resolution", "Resource optimization"],
        color: "from-red-500 to-purple-600"
      }
    ],
    security: [
      {
        icon: Shield,
        title: "Enterprise Security",
        description: "Bank-level encryption, SOC 2 compliance, and advanced security features to protect your data.",
        benefits: ["256-bit encryption", "SOC 2 certified", "GDPR compliant"],
        color: "from-indigo-500 to-purple-600"
      },
      {
        icon: Lock,
        title: "Advanced Access Control",
        description: "Multi-factor authentication, single sign-on, and granular permission management.",
        benefits: ["MFA support", "SSO integration", "Role-based access"],
        color: "from-purple-500 to-blue-600"
      },
      {
        icon: Globe,
        title: "Global Compliance",
        description: "Meet international standards with built-in compliance for various regulations and industries.",
        benefits: ["GDPR ready", "HIPAA compliant", "ISO certified"],
        color: "from-blue-500 to-green-600"
      }
    ],
    analytics: [
      {
        icon: BarChart3,
        title: "Advanced Analytics Dashboard",
        description: "Comprehensive insights into team performance, project metrics, and productivity trends.",
        benefits: ["Real-time metrics", "Custom reports", "Performance tracking"],
        color: "from-green-500 to-teal-600"
      },
      {
        icon: BarChart3,
        title: "Performance Insights",
        description: "AI-powered analysis of your team's work patterns to identify improvement opportunities.",
        benefits: ["Pattern recognition", "Optimization suggestions", "Progress tracking"],
        color: "from-teal-500 to-blue-600"
      },
      {
        icon: FileText,
        title: "Custom Reporting",
        description: "Create custom reports and dashboards tailored to your team's specific needs and KPIs.",
        benefits: ["Custom dashboards", "Export capabilities", "Scheduled reports"],
        color: "from-blue-500 to-indigo-600"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <Navbar />
      
      <HeroSection
        title="Powerful Features"
        subtitle="Built for Modern Teams"
        description="Discover how TaskFlow's AI-powered features transform your workflow, boost productivity, and help your team achieve more together."
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Watch Demo",
          onClick: () => console.log("Watch demo clicked")
        }}
      />

      {/* Category Navigation */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
        <Container size="6xl">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features[activeCategory as keyof typeof features].map((feature, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <Typography variant="h3" className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </Typography>
                    <Typography variant="body" className="text-slate-600 leading-relaxed mb-6">
                      {feature.description}
                    </Typography>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <Typography variant="body" className="text-slate-700 font-medium">
                          {benefit}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Ready to Experience These Features?"
        description="Join thousands of teams who've already transformed their workflow with TaskFlow"
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Schedule Demo",
          onClick: () => console.log("Schedule demo clicked")
        }}
      />
    </div>
  );
};

export default Features;
