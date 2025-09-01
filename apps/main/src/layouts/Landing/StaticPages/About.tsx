
import { Button } from "@taskflow/ui";
import { Card, CardContent } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";
import { Container } from "@taskflow/ui";

import HeroSection from '../../../components/common/HeroSection';
import CTASection from '../../../components/common/CTASection';
import { 
  Users,
  Heart,
  Globe,
  Lightbulb,
  Brain,
  Shield,
  Clock,
  Star,
  Quote,
  Linkedin
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "User-First Design",
      description: "Every feature we build starts with understanding our users' needs and pain points.",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: Brain,
      title: "AI Innovation",
      description: "We push the boundaries of what's possible with artificial intelligence and machine learning.",
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data security is our top priority. We never compromise on privacy and protection.",
      color: "from-blue-500 to-green-600"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe the best solutions come from working together and sharing knowledge.",
      color: "from-green-500 to-yellow-600"
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "TaskFlow was born from a simple idea: task management should be intelligent, not just functional.",
      icon: Lightbulb
    },
    {
      year: "2021",
      title: "First AI Features",
      description: "Launched our first AI-powered task prioritization and workflow automation features.",
      icon: Brain
    },
    {
      year: "2022",
      title: "10K Teams",
      description: "Reached our first major milestone with 10,000 teams using TaskFlow worldwide.",
      icon: Users
    },
    {
      year: "2023",
      title: "Enterprise Launch",
      description: "Introduced enterprise-grade features and compliance certifications for large organizations.",
      icon: Shield
    },
    {
      year: "2024",
      title: "50K+ Teams",
      description: "Now trusted by over 50,000 teams across 150+ countries, with advanced AI capabilities.",
      icon: Globe
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former product leader at Google and Microsoft. Passionate about making work more human and productive.",
      avatar: "SC",
      linkedin: "#"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      bio: "AI researcher with 15+ years in machine learning. Led teams at OpenAI and DeepMind.",
      avatar: "MR",
      linkedin: "#"
    },
    {
      name: "Emily Watson",
      role: "Head of Product",
      bio: "Product strategist focused on user experience. Previously at Figma and Notion.",
      avatar: "EW",
      linkedin: "#"
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      bio: "Full-stack engineer with expertise in scalable systems. Former tech lead at Stripe.",
      avatar: "DK",
      linkedin: "#"
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
        
      <HeroSection
        title="Our Mission"
        subtitle="Transform How Teams Work"
        description="We're on a mission to make work more intelligent, collaborative, and enjoyable. By combining cutting-edge AI with thoughtful design, we're helping teams achieve more together."
        primaryButton={{
          text: "Join Our Mission",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Watch Our Story",
          onClick: () => console.log("Watch story clicked")
        }}
      />

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
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

      {/* Story Section */}
      <section className="py-24">
        <Container size="6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                Our Story
              </Typography>
              <Typography variant="lead" className="text-xl text-slate-600 mb-8 leading-relaxed">
                TaskFlow was born from frustration. Our founders were tired of juggling multiple tools, 
                missing deadlines, and feeling overwhelmed by complex project management systems.
              </Typography>
              <Typography variant="body" className="text-lg text-slate-600 mb-8 leading-relaxed">
                They believed there had to be a better way. A way that combined the power of artificial 
                intelligence with intuitive design to make work feel effortless and enjoyable.
              </Typography>
              <Typography variant="body" className="text-lg text-slate-600 leading-relaxed">
                Today, we're proud to serve over 50,000 teams worldwide, helping them focus on what 
                matters most: doing great work together.
              </Typography>
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
                      <Quote className="w-4 h-4 text-white" />
                    </div>
                    <Typography variant="h4" className="text-white font-semibold">Our Vision</Typography>
                  </div>
                  <Typography variant="body" className="text-slate-300 leading-relaxed">
                    "To create a world where teams can focus on their best work, 
                    unhindered by the complexity of managing tasks and projects."
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
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
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}>
                    <value.icon className="w-10 h-10 text-white" />
                  </div>
                  <Typography variant="h3" className="text-xl font-bold mb-4 text-slate-900">
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

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <Container size="6xl">
          <div className="text-center mb-20">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Our Journey
            </Typography>
            <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
              Key milestones in our mission to transform team productivity
            </Typography>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
            
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <milestone.icon className="w-5 h-5 text-white" />
                        </div>
                        <Typography variant="h4" className="text-xl font-bold text-slate-900">
                          {milestone.title}
                        </Typography>
                      </div>
                      <Typography variant="body" className="text-slate-600">
                        {milestone.description}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pl-12 text-left' : 'pr-12 text-right'}`}>
                    <Typography variant="h3" className="text-3xl font-bold text-blue-600 mb-2">
                      {milestone.year}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
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
              The passionate people behind TaskFlow's mission
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
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Typography variant="h3" className="text-white font-bold text-xl">
                      {member.avatar}
                    </Typography>
                  </div>
                  <Typography variant="h3" className="text-xl font-bold mb-2 text-slate-900">
                    {member.name}
                  </Typography>
                  <Typography variant="body" className="text-blue-600 font-medium mb-4">
                    {member.role}
                  </Typography>
                  <Typography variant="body" className="text-slate-600 leading-relaxed mb-6">
                    {member.bio}
                  </Typography>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Join Our Mission"
        description="Be part of the revolution in how teams work together"
        primaryButton={{
          text: "Start Free Trial",
          href: "/signup"
        }}
        secondaryButton={{
          text: "Get in Touch",
          onClick: () => console.log("Get in touch clicked")
        }}
      />
    </div>
  );
};

export default About;
