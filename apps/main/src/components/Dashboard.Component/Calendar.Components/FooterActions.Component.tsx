import React from "react";
import { Button } from "@taskflow/ui";

export const FooterActions: React.FC<{ onAdd?: () => void; onCancel?: () => void }> = ({ onAdd, onCancel }) => {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <Button onClick={onAdd}>
        Add
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

export default FooterActions;
