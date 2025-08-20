import React from "react";

export const FooterActions: React.FC<{ onAdd?: () => void; onCancel?: () => void }> = ({ onAdd, onCancel }) => {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <button
        className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 rounded-lg font-medium"
        onClick={onAdd}
      >
        Add
      </button>
      <button className="bg-neutral-900 px-6 py-2 rounded-lg font-medium" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};

export default FooterActions;


