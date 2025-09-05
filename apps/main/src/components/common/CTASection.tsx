import React from 'react';
import { Button } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Container } from '@taskflow/ui';

interface CTAButton {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface CTASectionProps {
  title: string;
  description?: string;
  primaryButton?: CTAButton;
  secondaryButton?: CTAButton;
  showTrustText?: boolean;
  className?: string;
  variant?: 'default' | 'landing';
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  showTrustText = false,
  className = '',
  variant = 'default'
}) => {
  return (
    <section className={`py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white ${className}`}>
      <Container size="4xl">
        <div className="text-center max-w-3xl mx-auto">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6">
            {title}
          </Typography>
          {description && (
            <Typography variant="lead" className="text-xl mb-8 text-blue-100">
              {description}
            </Typography>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {primaryButton && (
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
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
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold"
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
          
          {showTrustText && (
            <Typography variant="body" className="text-blue-100 text-sm">
              Trusted by 10,000+ teams worldwide
            </Typography>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
