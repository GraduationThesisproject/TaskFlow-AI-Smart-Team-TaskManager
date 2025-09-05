export interface WorkspaceRules {
  content: string;
  lastUpdatedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  version: number;
  formattedContent?: string; // Virtual field from backend
  fileReference?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
  } | null;
}

export interface UpdateWorkspaceRulesData {
  content: string;
}

export interface UploadWorkspaceRulesData {
  file: File;
}

export interface WorkspaceRulesResponse {
  success: boolean;
  rules: WorkspaceRules;
  message?: string;
}

export interface WorkspaceRulesError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
