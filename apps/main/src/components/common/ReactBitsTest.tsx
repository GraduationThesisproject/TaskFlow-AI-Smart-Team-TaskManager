import React from 'react';
import { Brain, Users, Zap, Shield } from 'lucide-react';
import {
  FeatureCard,
  DataRenderer,
  Testimonials,
  ErrorBoundary,
  LazyComponent,
  withAnimation,
  ThemeProvider,
  useTheme
} from './ReactBitsPatterns';

// Test component to demonstrate React Bits patterns
export const ReactBitsTest: React.FC = () => {
  const testFeatures = [
    {
      icon: Brain,
      title: "AI Intelligence",
      description: "Advanced AI algorithms for smart decision making",
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless teamwork and communication",
      color: "from-blue-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "High-performance and optimized workflows",
      color: "from-green-500 to-yellow-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security and compliance",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const testTestimonials = [
    {
      name: "John Doe",
      role: "CEO",
      company: "TechCorp",
      content: "This is absolutely amazing! Our productivity increased by 300%.",
      avatar: "JD",
      rating: 5
    },
    {
      name: "Jane Smith",
      role: "CTO",
      company: "InnovateLab",
      content: "The best tool we've ever used. Highly recommended!",
      avatar: "JS",
      rating: 5
    },
    {
      name: "Mike Johnson",
      role: "Lead Developer",
      company: "CodeWorks",
      content: "Incredible features and amazing performance.",
      avatar: "MJ",
      rating: 5
    }
  ];

  const renderFeatureCard = (feature: typeof testFeatures[0], index: number) => (
    <FeatureCard key={index} className="delay-100">
      <FeatureCard.Icon icon={feature.icon} color={feature.color} />
      <FeatureCard.Title>{feature.title}</FeatureCard.Title>
      <FeatureCard.Description>{feature.description}</FeatureCard.Description>
    </FeatureCard>
  );

  const renderTestimonial = (testimonial: typeof testTestimonials[0], index: number) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
        </div>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="p-8 max-w-6xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">React Bits Patterns Test</h1>
            <p className="text-gray-600">Testing all implemented React Bits patterns</p>
          </div>

          {/* Theme Toggle Test */}
          <ThemeToggleTest />

          {/* Compound Components Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Compound Components Test</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DataRenderer
                data={testFeatures}
                renderItem={renderFeatureCard}
                renderEmpty={() => <div>No features available</div>}
              />
            </div>
          </section>

          {/* Render Props Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Render Props Test</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Numbers List</h3>
                <DataRenderer
                  data={[1, 2, 3, 4, 5]}
                  renderItem={(num) => (
                    <div key={num} className="p-3 bg-blue-100 rounded mb-2">
                      Number: {num}
                    </div>
                  )}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Empty State Test</h3>
                <DataRenderer
                  data={[]}
                  renderItem={() => null}
                  renderEmpty={() => (
                    <div className="p-4 bg-gray-100 rounded text-center text-gray-500">
                      No items to display
                    </div>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Testimonials Compound Component Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Testimonials Compound Component Test</h2>
            <div className="max-w-4xl mx-auto">
              <Testimonials totalCount={testTestimonials.length}>
                {testTestimonials.map((testimonial, index) => (
                  <Testimonials.Item key={index} index={index}>
                    {renderTestimonial(testimonial, index)}
                  </Testimonials.Item>
                ))}
                <Testimonials.Navigation />
                <Testimonials.Indicators />
              </Testimonials>
            </div>
          </section>

          {/* Lazy Loading Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Lazy Loading Test</h2>
            <div className="space-y-4">
              <LazyComponent fallback={<div className="p-4 bg-yellow-100 rounded">Loading content...</div>}>
                <div className="p-6 bg-green-100 rounded">
                  <h3 className="text-lg font-semibold mb-2">Lazy Loaded Content</h3>
                  <p>This content was loaded when it came into view!</p>
                </div>
              </LazyComponent>
              
              <LazyComponent fallback={<div className="p-4 bg-yellow-100 rounded">Loading more content...</div>}>
                <div className="p-6 bg-blue-100 rounded">
                  <h3 className="text-lg font-semibold mb-2">Another Lazy Component</h3>
                  <p>This is another piece of content that loads on scroll.</p>
                </div>
              </LazyComponent>
            </div>
          </section>

          {/* Error Boundary Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Error Boundary Test</h2>
            <ErrorBoundary fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="text-red-800 font-semibold">Error Caught!</h3>
                <p className="text-red-600">This error was caught by the Error Boundary</p>
              </div>
            }>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="text-green-800 font-semibold">Normal Content</h3>
                <p className="text-green-600">This content is working normally</p>
              </div>
            </ErrorBoundary>
          </section>

          {/* Animation HOC Test */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Animation HOC Test</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {testFeatures.slice(0, 2).map((feature, index) => {
                const AnimatedCard = withAnimation(() => (
                  <div className="p-6 bg-white rounded-lg shadow-md border">
                    <div className="flex items-center space-x-3">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
                ), 'animate-fade-in-up');
                
                return <AnimatedCard key={index} />;
              })}
            </div>
          </section>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Theme toggle component for testing
const ThemeToggleTest: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <section className="text-center">
      <h2 className="text-2xl font-bold mb-6">Theme Context Test</h2>
      <button
        onClick={toggleTheme}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Toggle Theme ({isDark ? 'Dark' : 'Light'})
      </button>
      <p className="mt-2 text-gray-600">
        Current theme: {isDark ? 'Dark Mode' : 'Light Mode'}
      </p>
    </section>
  );
};

export default ReactBitsTest;
