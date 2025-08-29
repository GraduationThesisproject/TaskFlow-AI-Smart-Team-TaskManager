import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  BoardTemplate, 
  CreateBoardTemplateRequest, 
  UpdateBoardTemplateRequest, 
  BoardTemplateFilters, 
  BoardTemplateStats,
  BoardTemplateListResponse,
  BoardTemplateResponse,
  BoardTemplateStatsResponse
} from '../../types/boardTemplate.types';
import { env } from '../../config/env';

interface BoardTemplateState {
  templates: BoardTemplate[];
  selectedTemplate: BoardTemplate | null;
  stats: BoardTemplateStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filters: BoardTemplateFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
}

const initialState: BoardTemplateState = {
  templates: [],
  selectedTemplate: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    search: '',
    categories: [],
    status: 'active',
    page: 1,
    limit: 20
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false
};

// Async thunks
export const fetchBoardTemplates = createAsyncThunk(
  'boardTemplates/fetchBoardTemplates',
  async (filters: BoardTemplateFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categories?.length) {
        filters.categories.forEach(cat => params.append('category', cat));
      }
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      console.log('🔍 Fetching board templates with token:', token.substring(0, 20) + '...');
      console.log('🔍 API URL:', `${env.API_BASE_URL}/board-templates/admin?${params}`);

      const response = await fetch(`${env.API_BASE_URL}/board-templates/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', response.status, errorData);
        
        if (response.status === 401) {
          return rejectWithValue('Authentication failed. Please log in again.');
        }
        
        return rejectWithValue(errorData.message || 'Failed to fetch board templates');
      }

      const data: BoardTemplateListResponse = await response.json();
      console.log('✅ Board templates fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Network error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchBoardTemplateStats = createAsyncThunk(
  'boardTemplates/fetchBoardTemplateStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      console.log('🔍 Fetching template stats with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${env.API_BASE_URL}/board-templates/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Stats API Error:', response.status, errorData);
        
        if (response.status === 401) {
          return rejectWithValue('Authentication failed. Please log in again.');
        }
        
        return rejectWithValue(errorData.message || 'Failed to fetch template statistics');
      }

      const data: BoardTemplateStatsResponse = await response.json();
      console.log('✅ Template stats fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Network error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createBoardTemplate = createAsyncThunk(
  'boardTemplates/createBoardTemplate',
  async (templateData: CreateBoardTemplateRequest, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔑 Admin Token:', adminToken ? 'Present' : 'Missing');
      console.log('🌐 API URL:', `${env.API_BASE_URL}/board-templates`);
      console.log('📤 Request Data:', templateData);
      
      // Sanitize the data to remove any circular references or DOM elements
      const sanitizeData = (obj: any, seen = new WeakSet()): any => {
        if (obj === null || typeof obj !== 'object') {
          return obj;
        }
        
        // Check for circular references
        if (seen.has(obj)) {
          console.log('🚫 Circular reference detected, removing');
          return undefined;
        }
        
        // Check for DOM elements or React components
        if (obj && typeof obj === 'object') {
          if (obj.nodeType !== undefined || 
              obj.__reactFiber$ !== undefined ||
              (obj.constructor && (obj.constructor.name.includes('HTML') || obj.constructor.name.includes('Element')))) {
            console.log('🚫 Removing problematic object:', obj.constructor?.name);
            return undefined;
          }
        }
        
        seen.add(obj);
        
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeData(item, seen)).filter(item => item !== undefined);
        }
        
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const sanitizedValue = sanitizeData(value, seen);
          if (sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
          }
        }
        
        return sanitized;
      };
      
      const sanitizedData = sanitizeData(templateData);
      console.log('📤 Sanitized Request Data:', sanitizedData);

      const response = await fetch(`${env.API_BASE_URL}/board-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error Response:', errorData);
        return rejectWithValue(errorData.message || 'Failed to create board template');
      }

      const data: BoardTemplateResponse = await response.json();
      console.log('✅ Success Response:', data);
      return data;
    } catch (error) {
      console.error('💥 Network Error Details:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateBoardTemplate = createAsyncThunk(
  'boardTemplates/updateBoardTemplate',
  async ({ id, templateData }: { id: string; templateData: Partial<CreateBoardTemplateRequest> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/board-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update board template');
      }

      const data: BoardTemplateResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteBoardTemplate = createAsyncThunk(
  'boardTemplates/deleteBoardTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/board-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete board template');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const toggleTemplateStatus = createAsyncThunk(
  'boardTemplates/toggleTemplateStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/board-templates/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to toggle template status');
      }

      const data: BoardTemplateResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const boardTemplateSlice = createSlice({
  name: 'boardTemplates',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<BoardTemplate | null>) => {
      state.selectedTemplate = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<BoardTemplateFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      if (action.payload.search !== undefined || action.payload.categories !== undefined || action.payload.status !== undefined) {
        state.filters.page = 1;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        categories: [],
        status: 'active',
        page: 1,
        limit: 20
      };
    },
    setShowCreateModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action: PayloadAction<boolean>) => {
      state.showEditModal = action.payload;
    },
    setShowDeleteModal: (state, action: PayloadAction<boolean>) => {
      state.showDeleteModal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Local state updates for immediate UI feedback
    updateTemplateLocally: (state, action: PayloadAction<Partial<BoardTemplate> & { id: string }>) => {
      const index = state.templates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...action.payload };
      }
    },
    removeTemplateLocally: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(template => template.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Board Templates
      .addCase(fetchBoardTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoardTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.data.templates;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(fetchBoardTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Template Stats
      .addCase(fetchBoardTemplateStats.pending, (state) => {
        // Don't set loading for stats as it's not critical
      })
      .addCase(fetchBoardTemplateStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(fetchBoardTemplateStats.rejected, (state, action) => {
        console.error('Failed to fetch template stats:', action.payload);
      })
      
      // Create Board Template
      .addCase(createBoardTemplate.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBoardTemplate.fulfilled, (state, action) => {
        state.isCreating = false;
        const newTemplate = action.payload.data;
        state.templates.unshift(newTemplate);
        state.showCreateModal = false;
        state.error = null;
      })
      .addCase(createBoardTemplate.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      
      // Update Board Template
      .addCase(updateBoardTemplate.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBoardTemplate.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTemplate = action.payload.data;
        const index = state.templates.findIndex(template => template.id === updatedTemplate.id);
        if (index !== -1) {
          state.templates[index] = updatedTemplate;
        }
        state.showEditModal = false;
        state.selectedTemplate = null;
        state.error = null;
      })
      .addCase(updateBoardTemplate.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Delete Board Template
      .addCase(deleteBoardTemplate.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBoardTemplate.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload;
        state.templates = state.templates.filter(template => template.id !== deletedId);
        state.showDeleteModal = false;
        state.selectedTemplate = null;
        state.error = null;
      })
      .addCase(deleteBoardTemplate.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      
      // Toggle Template Status
      .addCase(toggleTemplateStatus.pending, (state) => {
        // Don't set loading for status toggle
      })
      .addCase(toggleTemplateStatus.fulfilled, (state, action) => {
        const updatedTemplate = action.payload.data;
        const index = state.templates.findIndex(template => template.id === updatedTemplate.id);
        if (index !== -1) {
          state.templates[index] = updatedTemplate;
        }
        state.error = null;
      })
      .addCase(toggleTemplateStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedTemplate,
  setFilters,
  clearFilters,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  clearError,
  updateTemplateLocally,
  removeTemplateLocally
} = boardTemplateSlice.actions;

export default boardTemplateSlice.reducer;
