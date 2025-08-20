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
  { label: "Blue", value: "bg-blue-600" },
  { label: "Emerald", value: "bg-emerald-400" },
  { label: "Gray", value: "bg-gray-600" },
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
        <Typography variant="h3" as="h3">Add Plan {date ? `- Day ${date}` : ""}</Typography>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <Input placeholder="e.g., Standup" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <Select value={color} onChange={(e) => setColor(e.target.value)}>
              {COLOR_OPTIONS.map(opt => (
                <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>
              ))}
            </Select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={handleSave}>Add</Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddEventModal;


