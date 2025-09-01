import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import SignIn from "../layouts/Landing/SignIn";
import SignUp from "../layouts/Landing/SignUP";
import EmailVerification from "../layouts/Landing/EmailVerif";
import RecoverPassword from "../layouts/Landing/RecoverPass";
import ForgotPassword from "../layouts/Landing/ForgotPassword";
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Input } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import { 
  Brain, 
  Users, 
  Zap, 
  Shield, 
  Play,
  Twitter,
  Github,
  Linkedin,
  Facebook,
  MessageCircle
} from "lucide-react";

const LandingPageHome = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/support');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <Container size="4xl" className="text-center">
          <Typography 
            variant="h1" 
            className="text-5xl md:text-6xl mb-6"
          >
            AI-Powered Task Management<br />
            That Actually Works
          </Typography>
          <Typography 
            variant="lead" 
            className="mb-8 max-w-2xl mx-auto"
          >
            Transform your workflow with intelligent automation, seamless collaboration, 
            and AI insights that help your team achieve more in less time.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="gradient"
              className="px-8 py-3"
              asChild
            >
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <Container size="6xl">
          <Typography 
            variant="h2" 
            className="text-center mb-12"
          >
            Why Teams Choose TaskFlow
          </Typography>
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="elevated">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="h3" className="mb-3">
                      AI-Powered Insights
                    </Typography>
                    <Typography variant="muted">
                      Get intelligent recommendations, automated task prioritization, and predictive analytics 
                      to optimize your team&apos;s productivity.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="h3" className="mb-3">
                      Smart Collaboration
                    </Typography>
                    <Typography variant="muted">
                      Real-time updates, intelligent notifications, and seamless team communication 
                      in one unified workspace.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="h3" className="mb-3">
                      Lightning Fast
                    </Typography>
                    <Typography variant="muted">
                      Built for speed with instant sync, offline capabilities, and performance that scales 
                      with your growing team.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="h3" className="mb-3">
                      Enterprise Security
                    </Typography>
                    <Typography variant="muted">
                      Bank-level encryption, SOC 2 compliance, and advanced permissions 
                      to keep your data secure.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>


      {/* Social Proof Section */}
      <section className="py-20 bg-secondary/20">
        <Container size="6xl" className="text-center">
          <Typography variant="h2" className="mb-12">
            Trusted by 50,000+ Teams Worldwide
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
            {['OpenAI', 'Figma', 'Stripe', 'Canva', 'Shopify', 'Airbnb'].map((company) => (
              <div key={company} className="px-6 py-3 bg-secondary rounded hover:bg-accent/20 transition-colors">
                <Typography variant="small" className="font-semibold">
                  {company}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <Container size="4xl" className="text-center">
          <Typography 
            variant="lead" 
            className="text-xl md:text-2xl font-medium mb-8"
          >
            &quot;TaskFlow transformed our productivity completely. The AI insights helped us identify 
            bottlenecks we didn&apos;t even know existed, and now our team delivers projects 40% faster.&quot;
          </Typography>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Typography variant="small" className="text-primary-foreground font-semibold">
                JS
              </Typography>
            </div>
            <div className="text-left">
              <Typography variant="body-medium" className="font-semibold">
                Jessica Smith
              </Typography>
              <Typography variant="small" textColor="muted">
                Product Manager, TechCorp
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-secondary/20">
        <Container size="2xl" className="text-center">
          <Typography variant="h2" className="mb-4">
            Stay Updated
          </Typography>
          <Typography variant="muted" className="mb-8">
            Get the latest features and updates delivered to your inbox
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-background border-border"
            />
            <Button variant="gradient">Subscribe</Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <Container size="6xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <Typography variant="h2" className="mb-4">
                TaskFlow
              </Typography>
              <Typography variant="small" textColor="muted" className="mb-6">
                AI-powered task management that transforms how teams work together.
              </Typography>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon-sm">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <Typography variant="body-medium" className="font-semibold mb-4">
                Product
              </Typography>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Demo', 'API'].map((item) => (
                  <li key={item}>
                    <Typography 
                      variant="small" 
                      textColor="muted" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <Typography variant="body-medium" className="font-semibold mb-4">
                Company
              </Typography>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                  <li key={item}>
                    <Typography 
                      variant="small" 
                      textColor="muted" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <Typography variant="body-medium" className="font-semibold mb-4">
                Support
              </Typography>
              <ul className="space-y-2">
                {['Help Center', 'Contact', 'Status', 'Community'].map((item) => (
                  <li key={item}>
                    <Typography 
                      variant="small" 
                      textColor="muted" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item}
                    </Typography>
                  </li>
                ))}
                <li>
                  <button
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                    onClick={() => navigate('/chat')}
                  >
                    <MessageCircle className="w-4 h-4 group-hover:text-blue-500" />
                    <Typography variant="small">Live Chat</Typography>
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <Typography variant="body-medium" className="font-semibold mb-4">
                Legal
              </Typography>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'GDPR', 'Cookies'].map((item) => (
                  <li key={item}>
                    <Typography 
                      variant="small" 
                      textColor="muted" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <Typography variant="small" textColor="muted">
              © 2024 TaskFlow. All rights reserved.
            </Typography>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Typography variant="small" textColor="muted">
                🌐 English (US)
              </Typography>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export const LandingPage = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<LandingPageHome />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<RecoverPassword />} />
            </Routes>
        </div>
    );
};