import React, { useState } from "react";
import { 
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, TextArea, Select, SelectOption,
  Typography, Stack
} from "@taskflow/ui";
import type { CreateWorkspaceModalProps } from "../../types/dash.types";
import { useAppSelector } from "../../store";
import { useWorkspaces } from "../../hooks/useWorkspaces";

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector(state => state.auth);
  const { createNewWorkspace, loading } = useWorkspaces();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private" as "private" | "public"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Workspace name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    else if (formData.name.trim().length > 200) newErrors.name = "Name must be less than 200 characters";

    if (formData.description.length > 1000) newErrors.description = "Description must be less than 1000 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await createNewWorkspace({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        visibility: formData.visibility
      });
      setFormData({ name: "", description: "", visibility: "private" });
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "", visibility: "private" });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <Typography variant="h3">Create New Workspace</Typography>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Set up a new workspace for your team collaboration
        </Typography>
      </ModalHeader>

      <ModalBody>
        <Stack spacing="md">
          <div>
            <label className="block text-sm font-medium mb-2">Workspace Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={loading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <Typography variant="caption" className="text-destructive">{errors.name}</Typography>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={loading}
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <Typography variant="caption" className="text-destructive">{errors.description}</Typography>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <Select
              value={formData.visibility}
              onChange={(e) => handleInputChange("visibility", e.target.value)}
              disabled={loading}
            >
              {VISIBILITY_OPTIONS.map(opt => <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>)}
            </Select>
            <Typography variant="caption" className="text-muted-foreground mt-1">
              {formData.visibility === "private"
                ? "Only invited members can access this workspace"
                : "Anyone with the link can view this workspace"}
            </Typography>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Typography variant="body-medium" className="font-medium mb-1">Workspace Owner</Typography>
            <Typography variant="body-small" className="text-muted-foreground">
              {user?.user?.name || "You"} ({user?.user?.email})
            </Typography>
          </div>
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
          {loading ? "Creating..." : "Create Workspace"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
