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
    <div className="bg-gradient-to-r from-[#00EBCB] to-[#007ADF] shadow-[0_0_16px_3px_rgba(0,186,255,0.35)] hover:shadow-[0_0_22px_5px_rgba(0,186,255,0.55)] rounded-xl p-6 text-black relative text-white">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm mt-1">{description}</p>
      <Button variant="secondary" className="mt-3">{buttonText}</Button>
    </div>
  );
};

export default UpgradeCard;


