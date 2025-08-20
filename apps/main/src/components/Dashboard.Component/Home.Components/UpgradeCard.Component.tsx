import React from "react";
import { Button } from "@taskflow/ui";

interface UpgradeCardProps {
  title: string;
  description: string;
  buttonText?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title,
  description,
  buttonText = "Upgrade",
}) => {
  return (
    <div className="bg-gradient-to-r from-primary to-accent shadow-[0_0_16px_3px_rgba(var(--primary)/0.35)] hover:shadow-[0_0_22px_5px_rgba(var(--primary)/0.55)] rounded-xl p-6 relative text-primary-foreground">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm mt-1 text-primary-foreground/90">{description}</p>
      <Button variant="secondary" className="mt-3 bg-background/20 hover:bg-background/30 border-background/30 text-primary-foreground">
        {buttonText}
      </Button>
    </div>
  );
};

export default UpgradeCard;
