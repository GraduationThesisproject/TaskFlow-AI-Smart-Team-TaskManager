import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'Kanban' | 'Scrum' | 'Bug Tracking' | 'Custom';
  stages: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  stages: string[];
  createdAt: string;
  updatedAt: string;
}

interface AIPrompt {
  id: string;
  name: string;
  promptText: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandingAsset {
  id: string;
  customerName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesState {
  projectTemplates: ProjectTemplate[];
  taskTemplates: TaskTemplate[];
  aiPrompts: AIPrompt[];
  brandingAssets: BrandingAsset[];
  isLoading: boolean;
  error: string | null;
  selectedTemplate: ProjectTemplate | TaskTemplate | AIPrompt | BrandingAsset | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  modalType: 'project' | 'task' | 'ai' | 'branding' | null;
}

const initialState: TemplatesState = {
  projectTemplates: [],
  taskTemplates: [],
  aiPrompts: [],
  brandingAssets: [],
  isLoading: false,
  error: null,
  selectedTemplate: null,
  showCreateModal: false,
  showEditModal: false,
  modalType: null
};

// Async thunks
export const fetchProjectTemplates = createAsyncThunk(
  'templates/fetchProjectTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/templates/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch project templates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchTaskTemplates = createAsyncThunk(
  'templates/fetchTaskTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/templates/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch task templates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchAIPrompts = createAsyncThunk(
  'templates/fetchAIPrompts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/templates/ai-prompts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch AI prompts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchBrandingAssets = createAsyncThunk(
  'templates/fetchBrandingAssets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/templates/branding', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch branding assets');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createProjectTemplate = createAsyncThunk(
  'templates/createProjectTemplate',
  async (templateData: Partial<ProjectTemplate>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/templates/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create project template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateProjectTemplate = createAsyncThunk(
  'templates/updateProjectTemplate',
  async ({ id, templateData }: { id: string; templateData: Partial<ProjectTemplate> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/templates/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update project template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteProjectTemplate = createAsyncThunk(
  'templates/deleteProjectTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/templates/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete project template');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<ProjectTemplate | TaskTemplate | AIPrompt | BrandingAsset | null>) => {
      state.selectedTemplate = action.payload;
    },
    setShowCreateModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action: PayloadAction<boolean>) => {
      state.showEditModal = action.payload;
    },
    setModalType: (state, action: PayloadAction<'project' | 'task' | 'ai' | 'branding' | null>) => {
      state.modalType = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Local state updates for immediate UI feedback
    updateProjectTemplateLocally: (state, action: PayloadAction<Partial<ProjectTemplate> & { id: string }>) => {
      const index = state.projectTemplates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.projectTemplates[index] = { ...state.projectTemplates[index], ...action.payload };
      }
    },
    removeProjectTemplateLocally: (state, action: PayloadAction<string>) => {
      state.projectTemplates = state.projectTemplates.filter(template => template.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Project Templates
      .addCase(fetchProjectTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectTemplates = action.payload.templates || [];
        state.error = null;
      })
      .addCase(fetchProjectTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Task Templates
      .addCase(fetchTaskTemplates.fulfilled, (state, action) => {
        state.taskTemplates = action.payload.templates || [];
      })
      
      // Fetch AI Prompts
      .addCase(fetchAIPrompts.fulfilled, (state, action) => {
        state.aiPrompts = action.payload.prompts || [];
      })
      
      // Fetch Branding Assets
      .addCase(fetchBrandingAssets.fulfilled, (state, action) => {
        state.brandingAssets = action.payload.assets || [];
      })
      
      // Create Project Template
      .addCase(createProjectTemplate.fulfilled, (state, action) => {
        const newTemplate = action.payload.template;
        state.projectTemplates.unshift(newTemplate);
        state.showCreateModal = false;
        state.modalType = null;
      })
      
      // Update Project Template
      .addCase(updateProjectTemplate.fulfilled, (state, action) => {
        const updatedTemplate = action.payload.template;
        const index = state.projectTemplates.findIndex(template => template.id === updatedTemplate.id);
        if (index !== -1) {
          state.projectTemplates[index] = updatedTemplate;
        }
        state.showEditModal = false;
        state.selectedTemplate = null;
      })
      
      // Delete Project Template
      .addCase(deleteProjectTemplate.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.projectTemplates = state.projectTemplates.filter(template => template.id !== deletedId);
      });
  },
});

export const {
  setSelectedTemplate,
  setShowCreateModal,
  setShowEditModal,
  setModalType,
  clearError,
  updateProjectTemplateLocally,
  removeProjectTemplateLocally
} = templatesSlice.actions;

export default templatesSlice.reducer;
