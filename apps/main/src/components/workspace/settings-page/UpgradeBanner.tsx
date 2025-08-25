import React from 'react';
import { Card, Button, Typography, Gradient } from '@taskflow/ui';

interface UpgradeBannerProps {
  title: string;
  description: string;
  buttonText: string;
  onUpgrade?: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ 
  title, 
  description, 
  buttonText, 
  onUpgrade 
}) => {
  return (
    <Card className="overflow-hidden border-0 rounded-md shadow-[0_0_10px_hsl(var(--accent))]">
      <Gradient
        variant="primary"
        direction="to-r"
        className="p-0 rounded-md shadow-[0_0_0_1px_rgba(0,232,198,0.18),_0_8px_30px_-12px_rgba(0,122,223,0.45)]"
      >
        <div className="flex items-center justify-between p-5 shadow-[0_0_10px_hsl(var(--accent))]">
          <div>
            <Typography variant="h3" className="text-white">
              {title}
            </Typography>
            <Typography variant="caption" className="text-white/90">
              {description}
            </Typography>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 rounded-md px-5"
            size="sm"
            onClick={onUpgrade}
          >
            {buttonText}
          </Button>
        </div>
      </Gradient>
    </Card>
  );
};

export default UpgradeBanner;
