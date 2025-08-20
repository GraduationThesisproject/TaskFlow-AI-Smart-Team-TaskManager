import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Input, Select, SelectOption, Typography } from "@taskflow/ui";

export interface AddEventData {
  date: number;
  title: string;
  color: string; // tailwind bg class
}

interface AddEventModalProps {
  isOpen: boolean;
  date: number | null;
  onClose: () => void;
  onSave: (data: AddEventData) => void;
}

const COLOR_OPTIONS = [
  { label: "Primary", value: "bg-primary" },
  { label: "Accent", value: "bg-accent" },
  { label: "Muted", value: "bg-muted" },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, date, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setColor(COLOR_OPTIONS[0].value);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!date) return;
    if (!title.trim()) return;
    onSave({ date, title: title.trim(), color });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <Typography variant="h3" as="h3" className="text-foreground">Add Plan {date ? `- Day ${date}` : ""}</Typography>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Title</label>
            <Input 
              placeholder="e.g., Standup" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Color</label>
            <Select 
  value={color} 
  onChange={(e) => setColor(e.target.value)}
>
  {COLOR_OPTIONS.map((option) => (
    <SelectOption key={option.value} value={option.value}>
      <div className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded-full ${option.value}`}></span>
        {option.label}
      </div>
    </SelectOption>
  ))}
</Select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddEventModal;
