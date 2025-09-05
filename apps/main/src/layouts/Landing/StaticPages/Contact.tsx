import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import { Input } from "@taskflow/ui";

import { 
  Mail,
  MapPin,
  Phone,

  Send,
  CheckCircle,
  Users,
  Globe,
  Shield
} from "lucide-react";
import HeroSection from '../../../components/common/HeroSection';
import CTASection from '../../../components/common/CTASection';

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        subject: 'general'
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our support team",
      contact: "hello@taskflow.com",
      action: "Send Email",
      href: "mailto:hello@taskflow.com",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
      href: "tel:+15551234567",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Drop by our office anytime",
      contact: "San Francisco, CA",
      action: "Get Directions",
      href: "#",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const supportHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM PST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM PST" },
    { day: "Sunday", hours: "Closed" }
  ];

  const faqs = [
    {
      question: "How quickly do you respond to inquiries?",
      answer: "We typically respond to all inquiries within 2-4 hours during business hours, and within 24 hours for after-hours messages."
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer: "Yes! We work closely with enterprise clients to create custom solutions tailored to their specific needs and workflows."
    },
    {
      question: "Can I schedule a demo of TaskFlow?",
      answer: "Absolutely! We'd love to show you around TaskFlow. You can schedule a personalized demo at a time that works for you."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      
      <HeroSection
        title="Get in Touch"
        subtitle="We'd Love to Hear from You"
        description="Have questions about TaskFlow? Want to learn more about our AI-powered features? Or ready to transform your team's workflow? We're here to help."
        primaryButton={{
          text: "Schedule Demo",
          href: "/demo"
        }}
        secondaryButton={{
          text: "View Pricing",
          onClick: () => console.log("View pricing clicked")
        }}
      />

      {/* Contact Methods */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${method.color} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}>
                    <method.icon className="w-10 h-10 text-white" />
                  </div>
                  <Typography variant="h3" className="text-xl font-bold mb-3 text-slate-900">
                    {method.title}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 mb-4">
                    {method.description}
                  </Typography>
                  <Typography variant="body" className="text-lg font-semibold text-slate-900 mb-6">
                    {method.contact}
                  </Typography>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    asChild
                  >
                    <Link to={method.href}>
                      {method.action}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Container size="6xl">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Typography variant="h2" className="text-3xl font-bold mb-8 text-slate-900">
                Send us a Message
              </Typography>
              
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <Typography variant="h3" className="text-xl font-bold text-green-800 mb-2">
                    Message Sent Successfully!
                  </Typography>
                  <Typography variant="body" className="text-green-700">
                    Thank you for reaching out. We'll get back to you within 2-4 hours.
                  </Typography>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="sales">Sales Question</option>
                        <option value="support">Technical Support</option>
                        <option value="demo">Schedule Demo</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Message...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <Typography variant="h3" className="text-2xl font-bold mb-6 text-slate-900">
                  Contact Information
                </Typography>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="body-medium" className="font-semibold text-slate-900">
                        Email
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        hello@taskflow.com
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        support@taskflow.com
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="body-medium" className="font-semibold text-slate-900">
                        Phone
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        +1 (555) 123-4567
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        Mon-Fri 9AM-6PM PST
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography variant="body-medium" className="font-semibold text-slate-900">
                        Office
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        123 Innovation Drive
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        San Francisco, CA 94105
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="text-2xl font-bold mb-6 text-slate-900">
                  Support Hours
                </Typography>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className={`flex justify-between py-3 ${index !== supportHours.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <Typography variant="body" className="font-medium text-slate-900">
                        {schedule.day}
                      </Typography>
                      <Typography variant="body" className="text-slate-600">
                        {schedule.hours}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="text-2xl font-bold mb-6 text-slate-900">
                  Why Choose TaskFlow?
                </Typography>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <Typography variant="body" className="text-slate-700">
                      Trusted by 50K+ teams worldwide
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <Typography variant="body" className="text-slate-700">
                      Available in 150+ countries
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <Typography variant="body" className="text-slate-700">
                      Enterprise-grade security & compliance
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <Container size="4xl">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Frequently Asked Questions
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              Quick answers to common questions about getting in touch
            </Typography>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8">
                <Typography variant="h4" className="text-xl font-semibold mb-4 text-slate-900">
                  {faq.question}
                </Typography>
                <Typography variant="body" className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </Typography>
              </div>
            ))}
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
      />
    </div>
  );
};

export default Contact;
