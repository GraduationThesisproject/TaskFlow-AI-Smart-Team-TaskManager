import React from 'react';
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import CTASection from "../components/common/CTASection";
import { 
  Users, 
  Target,
  Heart,
  Zap,
  Award,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Building,
  Lightbulb
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Users,
      title: "Team First",
      description: "We believe that great products are built by great teams working together."
    },
    {
      icon: Target,
      title: "Customer Focused",
      description: "Every decision we make starts with understanding our customers' needs."
    },
    {
      icon: Heart,
      title: "Passion for Innovation",
      description: "We're driven by the desire to solve complex problems with elegant solutions."
    },
    {
      icon: Zap,
      title: "Speed & Agility",
      description: "We move fast, learn quickly, and adapt to changing market needs."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "TaskFlow was born from a simple idea: make project management as intuitive as possible."
    },
    {
      year: "2021",
      title: "First 1000 Users",
      description: "We reached our first major milestone with teams from around the world."
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Launched our revolutionary AI-powered task prioritization system."
    },
    {
      year: "2023",
      title: "Enterprise Launch",
      description: "Expanded to serve large organizations with enterprise-grade features."
    },
    {
      year: "2024",
      title: "50K+ Teams",
      description: "Celebrated serving over 50,000 teams across 150+ countries."
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-founder",
      bio: "Former product leader at Google with 15+ years building user-centric products.",
      avatar: "SC",
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-founder",
      bio: "Ex-engineering director at Microsoft, passionate about AI and scalable systems.",
      avatar: "MR",
      color: "from-purple-500 to-pink-600"
    },
    {
      name: "Emily Watson",
      role: "Head of Product",
      bio: "Product strategist with experience at Slack and Asana, focused on user experience.",
      avatar: "EW",
      color: "from-green-500 to-blue-600"
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      bio: "Full-stack expert who's led engineering teams at Twitter and GitHub.",
      avatar: "DK",
      color: "from-orange-500 to-red-600"
    }
  ];

  const stats = [
    { number: "50K+", label: "Teams Worldwide", icon: Users },
    { number: "150+", label: "Countries", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Clock },
    { number: "4.9/5", label: "User Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <Navbar />
      
      <HeroSection
        title="Our Mission"
        subtitle="Empowering Teams"
        description="We're building the future of work by creating intelligent tools that help teams collaborate, innovate, and achieve their goals together."
        primaryButton={{
          text: "Join Our Team",
          href: "/careers"
        }}
        secondaryButton={{
          text: "Contact Us",
          onClick: () => console.log("Contact us clicked")
        }}
      />

      {/* Mission Section */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                Transforming How Teams Work
              </Typography>
              <Typography variant="lead" className="text-xl text-slate-600 mb-8 leading-relaxed">
                At TaskFlow, we believe that the best teams deserve the best tools. Our mission is to eliminate the friction that stands between great ideas and great execution.
              </Typography>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                      AI-Powered Intelligence
                    </Typography>
                    <Typography variant="body" className="text-slate-600">
                      We leverage cutting-edge AI to automate routine tasks and provide intelligent insights
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                      Seamless Collaboration
                    </Typography>
                    <Typography variant="body" className="text-slate-600">
                      Built for real-time teamwork with intuitive interfaces that just work
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <Typography variant="body-medium" className="font-semibold text-slate-900 mb-1">
                      Enterprise Security
                    </Typography>
                    <Typography variant="body" className="text-slate-600">
                      Trusted by Fortune 500 companies with enterprise-grade security and compliance
                    </Typography>
                  </div>
                </div>
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
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <Typography variant="h4" className="text-white font-semibold">Our Vision</Typography>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">AI-First Approach</span>
                      <span className="text-green-400 font-medium">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Global Scale</span>
                      <span className="text-green-400 font-medium">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Team Success</span>
                      <span className="text-green-400 font-medium">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Our Values
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </Typography>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6">
                    <value.icon className="w-10 h-10 text-blue-600" />
                  </div>
                  <Typography variant="h3" className="text-xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {value.title}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 leading-relaxed">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Container size="6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
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
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Our Journey
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              From startup to serving teams worldwide
            </Typography>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-8 mb-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <Typography variant="h3" className="text-2xl font-bold mb-3 text-slate-900">
                    {milestone.title}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 leading-relaxed">
                    {milestone.description}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Meet Our Team
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              The passionate people behind TaskFlow
            </Typography>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card 
                key={index}
                variant="elevated" 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${member.color} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}>
                    <Typography variant="h3" className="text-white font-bold text-2xl">
                      {member.avatar}
                    </Typography>
                  </div>
                  <Typography variant="h3" className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </Typography>
                  <Typography variant="body-medium" className="text-blue-600 font-semibold mb-4">
                    {member.role}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 leading-relaxed">
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Ready to Join the Future of Work?"
        description="Be part of the revolution that's transforming how teams collaborate and succeed"
        primaryButton={{
          text: "Start Free Trial",
          onClick: () => console.log("Start Free Trial clicked - handled by parent")
        }}
        secondaryButton={{
          text: "Learn More",
          onClick: () => console.log("Learn more clicked")
        }}
        showTrustText={true}
        trustText="Join 50K+ teams worldwide • 14-day free trial • No credit card required"
      />
    </div>
  );
};

export default About;
