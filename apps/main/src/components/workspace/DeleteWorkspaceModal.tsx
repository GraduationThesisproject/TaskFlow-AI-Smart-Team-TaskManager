import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Typography,
} from "@taskflow/ui";
import { AlertTriangle } from "lucide-react";
import type { DeleteWorkspaceModalProps } from "../../types/dash.types";
import { useWorkspaces } from "../../hooks/useWorkspaces";

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspace,
}) => {
  const { deleteCurrentWorkspace, loading } = useWorkspaces();

  const handleConfirm = async () => {
    if (!workspace) return;
    try {
      await deleteCurrentWorkspace(workspace.id); 
      onClose();
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          <Typography variant="h4">Delete Workspace</Typography>
        </div>
      </ModalHeader>

      <ModalBody>
        <Typography variant="body-medium" className="text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            “{workspace?.name || "this workspace"}”
          </span>
          ? This action cannot be undone.
        </Typography>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
