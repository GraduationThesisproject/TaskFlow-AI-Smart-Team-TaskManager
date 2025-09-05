import React from 'react';
import { Typography } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import Logo from './Logo';

interface CTAButton {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  primaryButton?: CTAButton;
  secondaryButton?: CTAButton;
  showBadge?: boolean;
  badgeText?: string;
  variant?: 'default' | 'landing';
  showLogo?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  description, 
  className = '',
  primaryButton,
  secondaryButton,
  showBadge = false,
  badgeText,
  showLogo = true
}) => {
  return (
    <section className={`py-24 text-center ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Logo Section */}
        {showLogo && (
          <div className="flex justify-center mb-12">
            <Logo 
              variant="full" 
              size="xl" 
              animated={true}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {showBadge && badgeText && (
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            {badgeText}
          </div>
        )}
        
        {subtitle && (
          <Typography variant="lead" className="text-blue-600 font-semibold mb-4">
            {subtitle}
          </Typography>
        )}
        
        <Typography variant="h1" className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
          {title}
        </Typography>
        
        {description && (
          <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            {description}
          </Typography>
        )}
        
        {(primaryButton || secondaryButton) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryButton && (
              <Button 
                size="lg" 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                asChild={!!primaryButton.href}
                onClick={primaryButton.onClick}
              >
                {primaryButton.href ? (
                  <a href={primaryButton.href}>{primaryButton.text}</a>
                ) : (
                  primaryButton.text
                )}
              </Button>
            )}
            
            {secondaryButton && (
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                asChild={!!secondaryButton.href}
                onClick={secondaryButton.onClick}
              >
                {secondaryButton.href ? (
                  <a href={secondaryButton.href}>{secondaryButton.text}</a>
                ) : (
                  secondaryButton.text
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
