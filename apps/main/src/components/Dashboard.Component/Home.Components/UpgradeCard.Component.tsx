import React from "react";
import { Button, Card } from "@taskflow/ui";
import type { UpgradeCardProps } from "../../../types/dashboard";


export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title,
  description,
  buttonText = "Upgrade",
}) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-5 cursor-pointer">
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 relative text-primary-foreground">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm mt-1 text-primary-foreground/90">{description}</p>
        <Button 
          size="sm" 
          variant="secondary" 
          className="mt-3 bg-background/20 border-background/30 text-primary-foreground"
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default UpgradeCard;
