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
    <div className="bg-gradient-to-r from-sky-500 to-emerald-400 rounded-xl p-6 text-black">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm mt-1">{description}</p>
      <Button variant="secondary" className="mt-3">{buttonText}</Button>
    </div>
  );
};

export default UpgradeCard;


