import React, { useState } from 'react';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import { Input } from "@taskflow/ui";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import CTASection from "../components/common/CTASection";
import { 
  Mail, 
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  Users,
  Globe,
  Building
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    subject: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after showing success message
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        subject: 'general'
      });
    }, 5000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our support team",
      contact: "hello@taskflow.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters location",
      contact: "San Francisco, CA",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "When we're available",
      contact: "Mon-Fri, 9AM-6PM PST",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const subjects = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Product Feedback' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <Navbar />
      
      <HeroSection
        title="Get in Touch"
        subtitle="We'd Love to Hear From You"
        description="Have questions about TaskFlow? Want to learn more about our features? Need help with your account? We're here to help."
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "View Documentation",
          onClick: () => console.log("View docs clicked")
        }}
      />

      {/* Contact Methods */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
        <Container size="6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <Typography variant="h3" className="text-lg font-bold mb-2 text-slate-900">
                    {method.title}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 mb-3">
                    {method.description}
                  </Typography>
                  <Typography variant="body-medium" className="text-blue-600 font-semibold">
                    {method.contact}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Typography variant="h2" className="text-3xl font-bold mb-8 text-slate-900">
                Send us a Message
              </Typography>
              
              {isSubmitted ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <Typography variant="h3" className="text-xl font-bold mb-2 text-green-800">
                      Message Sent Successfully!
                    </Typography>
                    <Typography variant="body" className="text-green-700">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </div>
            
            {/* Contact Information */}
            <div>
              <Typography variant="h2" className="text-3xl font-bold mb-8 text-slate-900">
                More Ways to Connect
              </Typography>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-xl font-bold mb-2 text-slate-900">
                        Customer Success
                      </Typography>
                      <Typography variant="body" className="text-slate-600 mb-3">
                        Get personalized help with your TaskFlow implementation
                      </Typography>
                      <Typography variant="body-medium" className="text-blue-600 font-semibold">
                        success@taskflow.com
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-xl font-bold mb-2 text-slate-900">
                        Enterprise Sales
                      </Typography>
                      <Typography variant="body" className="text-slate-600 mb-3">
                        Learn about enterprise features and custom solutions
                      </Typography>
                      <Typography variant="body-medium" className="text-blue-600 font-semibold">
                        enterprise@taskflow.com
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-xl font-bold mb-2 text-slate-900">
                        Global Support
                      </Typography>
                      <Typography variant="body" className="text-slate-600 mb-3">
                        Available in multiple languages and time zones
                      </Typography>
                      <Typography variant="body-medium" className="text-blue-600 font-semibold">
                        Available 24/7
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-slate-50 rounded-2xl p-8">
                <Typography variant="h3" className="text-xl font-bold mb-4 text-slate-900">
                  Response Time
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">General inquiries</span>
                    <span className="text-slate-900 font-semibold">24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Technical support</span>
                    <span className="text-slate-900 font-semibold">4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Enterprise sales</span>
                    <span className="text-slate-900 font-semibold">2 hours</span>
                  </div>
                </div>
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
          href: "/signup"
        }}
        secondaryButton={{
          text: "Schedule Demo",
          onClick: () => console.log("Schedule demo clicked")
        }}
        showTrustText={true}
        trustText="14-day free trial • No credit card required • Cancel anytime"
      />
    </div>
  );
};

export default Contact;
