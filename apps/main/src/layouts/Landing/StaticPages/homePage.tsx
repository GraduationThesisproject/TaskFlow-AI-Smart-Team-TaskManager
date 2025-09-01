import  { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import HeroSection from "../../../components/common/HeroSection";
import CTASection from "../../../components/common/CTASection";
import Logo from "../../../components/common/Logo";
import { 
  Play,
  CheckCircle,
  Brain,
  Users,
  Zap,
  Shield,
  Target,
  Clock,
  Globe,
  Star,
  Rocket,
  TrendingUp,
  Award,
} from "lucide-react";

// Import React Bits patterns
import {
  FeatureCard,
  DataRenderer,
  Testimonials,
  ErrorBoundary,
  LazyComponent,
  withAnimation,
  useIntersectionObserver,
} from "../../../components/common/ReactBitsPatterns";

// Animated components using HOC
const AnimatedFeatureCard = withAnimation(FeatureCard, 'animate-fade-in-up');

const LandingPageHome = () => {
  // Memoized data to prevent unnecessary re-renders
  const features = useMemo(() => [
    {
      icon: Brain,
      title: "AI-Powered Task Prioritization",
      description: "Intelligent algorithms analyze your team's patterns and automatically prioritize tasks based on urgency, dependencies, and team capacity.",
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Seamless Team Collaboration",
      description: "Real-time updates, instant messaging, and collaborative editing features that keep your team connected and productive.",
      color: "from-blue-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Smart Workflow Automation",
      description: "Automate repetitive tasks, create intelligent workflows, and let AI handle routine project management for you.",
      color: "from-green-500 to-yellow-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and advanced security features to protect your team's sensitive data.",
      color: "from-yellow-500 to-orange-600"
    }
  ], []);

  const stats = useMemo(() => [
    { number: "50K+", label: "Teams Worldwide", icon: Users },
    { number: "150+", label: "Countries", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Clock },
    { number: "4.9/5", label: "User Rating", icon: Star }
  ], []);

  const testimonials = useMemo(() => [
    {
      name: "Bassem Douzi",
      role: "CEO",
      company: "Company",
      content: "TaskFlow has completely transformed how our team works. The AI prioritization alone has saved us 10+ hours per week.",
      avatar: "SC",
      rating: 5 
    },
    {
      name: "Bassem Douzi",
      role: "Engineering Lead",
      company: "Company",
      content: "The automation features are incredible. We've reduced our project delivery time by 40% since switching to TaskFlow.",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Bassem Douzi",
      role: "Team Lead",
      company: "Company",
      content: "Finally, a tool that actually makes collaboration feel natural. Our team productivity has never been higher.",
      avatar: "EW",
      rating: 5
    }
  ], []);

  // Intersection observer for animations
  const [setStatsRef, isStatsVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Memoized render functions for DataRenderer
  const renderFeatureCard = useCallback((feature: typeof features[0], index: number) => (
    <AnimatedFeatureCard key={index} className="delay-100">
      <FeatureCard.Icon icon={feature.icon} color={feature.color} />
      <FeatureCard.Title>{feature.title}</FeatureCard.Title>
      <FeatureCard.Description>{feature.description}</FeatureCard.Description>
    </AnimatedFeatureCard>
  ), []);

  const renderStatCard = useCallback((stat: typeof stats[0], index: number) => (
    <div key={index} className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
        <stat.icon className="w-8 h-8 text-blue-600" />
      </div>
      <Typography variant="h3" className="text-3xl font-bold text-slate-900 mb-2">
        {stat.number}
      </Typography>
      <Typography variant="body" className="text-slate-600 font-medium">
        {stat.label}
      </Typography>
    </div>
  ), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
        
        <HeroSection
          title="Transform Your"
          subtitle="Workflow"
          description="Experience the future of task management with intelligent automation, seamless collaboration, and AI insights that help your team achieve more in less time."
          primaryButton={{
            text: "Start Free Trial",
            href: "/signup"
          }}
          secondaryButton={{
            text: "Watch Demo",
            onClick: () => console.log("Watch demo clicked")
          }}
          showBadge={true}
          badgeText="AI-Powered • Trusted by 50K+ Teams"
          variant="landing"
        />

        {/* Stats Section with Lazy Loading */}
        <LazyComponent>
          <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
            <Container size="6xl">
              <div ref={setStatsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <DataRenderer
                  data={stats}
                  renderItem={renderStatCard}
                  renderLoading={() => (
                    <div className="col-span-4 text-center">
                      <div className="animate-pulse">Loading stats...</div>
                    </div>
                  )}
                />
              </div>
            </Container>
          </section>
        </LazyComponent>

        {/* Features Section with Compound Components */}
        <LazyComponent>
          <section className="py-24">
            <Container size="6xl">
              <div className="text-center mb-20">
                <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                  Why Teams Choose TaskFlow
                </Typography>
                <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Powerful features designed to make your team more productive, collaborative, and successful
                </Typography>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <DataRenderer
                  data={features}
                  renderItem={renderFeatureCard}
                  renderEmpty={() => (
                    <div className="col-span-4 text-center text-slate-500">
                      No features available at the moment.
                    </div>
                  )}
                />
              </div>
            </Container>
          </section>
        </LazyComponent>

        {/* Interactive Demo Section */}
        <LazyComponent>
          <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
            <Container size="6xl">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                    See TaskFlow in Action
                  </Typography>
                  <Typography variant="lead" className="text-xl text-slate-600 mb-8 leading-relaxed">
                    Experience the intuitive interface and powerful features that make TaskFlow the preferred choice for modern teams.
                  </Typography>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                          AI-Powered Insights
                        </Typography>
                        <Typography variant="body" className="text-slate-600">
                          Get intelligent recommendations for task prioritization and resource allocation
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                          Real-time Collaboration
                        </Typography>
                        <Typography variant="body" className="text-slate-600">
                          Work together seamlessly with live updates and instant communication
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                          Advanced Analytics
                        </Typography>
                        <Typography variant="body" className="text-slate-600">
                          Track performance, identify bottlenecks, and optimize your workflow
                        </Typography>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button 
                      size="lg" 
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-3 border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    >
                      Try Interactive Demo
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <Typography variant="h4" className="text-white font-semibold">AI Task Prioritization</Typography>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Project Alpha</span>
                          <span className="text-green-400 font-medium">High Priority</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Bug Fix #123</span>
                          <span className="text-yellow-400 font-medium">Medium</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Documentation</span>
                          <span className="text-blue-400 font-medium">Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </LazyComponent>

        {/* Social Proof Section with Compound Components */}
        <LazyComponent>
          <section className="py-24 bg-white">
            <Container size="6xl">
              <div className="text-center mb-16">
                <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                  Loved by Teams Worldwide
                </Typography>
                <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
                  See what our users have to say about their experience with TaskFlow
                </Typography>
              </div>
              
              <div className="relative max-w-4xl mx-auto">
                <Testimonials totalCount={testimonials.length}>
                  {testimonials.map((testimonial, index) => (
                    <Testimonials.Item key={index} index={index}>
                      <div className="bg-white rounded-3xl p-12 shadow-2xl border border-slate-200">
                        <div className="text-center mb-8">
                          <div className="flex justify-center space-x-1 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <Typography variant="body" className="text-slate-600 italic text-lg leading-relaxed">
                            "{testimonial.content}"
                          </Typography>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Typography variant="h3" className="text-white font-bold text-xl">
                              {testimonial.avatar}
                            </Typography>
                          </div>
                          <Typography variant="h4" className="text-lg font-semibold text-slate-900 mb-1">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body" className="text-slate-600">
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                        </div>
                      </div>
                    </Testimonials.Item>
                  ))}
                  
                  <Testimonials.Navigation />
                  <Testimonials.Indicators />
                </Testimonials>
              </div>
            </Container>
          </section>
        </LazyComponent>

        {/* Trust Indicators */}
        <LazyComponent>
          <section className="py-16 bg-slate-50/50">
            <Container size="6xl">
              <div className="text-center mb-12">
                <Typography variant="h3" className="text-2xl font-semibold text-slate-700 mb-4">
                  Trusted by Industry Leaders
                </Typography>
              </div>
              
              <div className="flex items-center justify-center space-x-12 opacity-60">
                <div className="text-slate-400 font-semibold text-lg">Company</div>
                <div className="text-slate-400 font-semibold text-lg">GrowthCo</div>
                <div className="text-slate-400 font-semibold text-lg">FutureTech</div>
              </div>
            </Container>
          </section>
        </LazyComponent>

        <CTASection
          title="Ready to Transform Your Workflow?"
          description="Join thousands of teams who've already discovered the power of AI-powered task management"
          primaryButton={{
            text: "Start Free Trial",
            href: "/signup"
          }}
          secondaryButton={{
            text: "Schedule Demo",
            onClick: () => console.log("Schedule demo clicked")
          }}
          showTrustText={true}
          variant="landing"
        />

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <Container size="6xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-6">
                  <Logo variant="minimal" size="lg" showTagline={false} />
                </div>
                <Typography variant="body" className="text-slate-300 mb-6 max-w-md">
                  Transform your team's productivity with AI-powered task management, 
                  intelligent automation, and seamless collaboration.
                </Typography>
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <Rocket className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <Award className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Typography variant="h4" className="text-lg font-semibold mb-6 text-white">
                  Product
                </Typography>
                <div className="space-y-3">
                  <Link to="/features" className="block text-slate-300 hover:text-white transition-colors">Features</Link>
                  <Link to="/pricing" className="block text-slate-300 hover:text-white transition-colors">Pricing</Link>
                  <Link to="/integrations" className="block text-slate-300 hover:text-white transition-colors">Integrations</Link>
                  <Link to="/api" className="block text-slate-300 hover:text-white transition-colors">API</Link>
                </div>
              </div>
              
              <div>
                <Typography variant="h4" className="text-lg font-semibold mb-6 text-white">
                  Company
                </Typography>
                <div className="space-y-3">
                  <Link to="/about" className="block text-slate-300 hover:text-white transition-colors">About</Link>
                  <Link to="/contact" className="block text-slate-300 hover:text-white transition-colors">Contact</Link>
                  <Link to="/careers" className="block text-slate-300 hover:text-white transition-colors">Careers</Link>
                  <Link to="/blog" className="block text-slate-300 hover:text-white transition-colors">Blog</Link>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <Typography variant="small" className="text-slate-400">
                © 2024 TaskFlow. All rights reserved.
              </Typography>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
                <Link to="/cookies" className="text-slate-400 hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default LandingPageHome;