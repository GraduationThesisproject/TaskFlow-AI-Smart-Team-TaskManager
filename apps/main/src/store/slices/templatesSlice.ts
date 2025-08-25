import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { TemplateItem, TemplatesFilters, TemplatesState } from '../../types/dash.types';

// Initial state
const initialState: TemplatesState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  filters: { status: 'active' },
};

// Helpers
const toQuery = (params: Record<string, any>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  const qs = new URLSearchParams(entries as any).toString();
  return `?${qs}`;
};

// Thunks
export const listTemplates = createAsyncThunk(
  'templates/list',
  async (params: TemplatesFilters | undefined, { rejectWithValue }) => {
    try {
      const query = toQuery(params || {});
      const res = await apiClient.get<{ success: boolean; data: TemplateItem[] }>(`/templates${query}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load templates');
    }
  }
);

// Admin-only: list all templates (backend must support scope=all)
export const listAllTemplates = createAsyncThunk(
  'templates/listAll',
  async (params: TemplatesFilters | undefined, { rejectWithValue }) => {
    try {
      const merged = { ...(params || {}), scope: 'all' as const };
      const query = toQuery(merged as Record<string, any>);
      const res = await apiClient.get<{ success: boolean; data: TemplateItem[] }>(`/templates${query}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load templates (all)');
    }
  }
);

export const getTemplate = createAsyncThunk(
  'templates/get',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: TemplateItem }>(`/templates/${id}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load template');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (payload: Partial<TemplateItem>, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: TemplateItem }>(`/templates`, payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, updates }: { id: string; updates: Partial<TemplateItem> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: TemplateItem }>(`/templates/${id}`, updates);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to update template');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete<{ success: boolean }>(`/templates/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to delete template');
    }
  }
);

export const incrementTemplateViews = createAsyncThunk(
  'templates/incrementViews',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: TemplateItem }>(
        `/templates/${id}/views`,
        undefined,
        { suppressErrorLog: true }
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to increment views');
    }
  }
);

export const toggleTemplateLike = createAsyncThunk(
  'templates/toggleLike',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: TemplateItem }>(
        `/templates/${id}/like`,
        undefined,
        { suppressErrorLog: true }
      );
      console.log("toggle like",res.data)
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to toggle like');
    }
  }
);

// Slice
const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TemplatesFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(listTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(listTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load templates';
      })
      // list all (admin)
      .addCase(listAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(listAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load templates (all)';
      })
      // get
      .addCase(getTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load template';
      })
      // create
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create template';
      })
      // update
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.selected?._id === action.payload._id) state.selected = action.payload;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update template';
      })
      // delete
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((t) => t._id !== action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete template';
      })
      // increment views
      .addCase(incrementTemplateViews.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t._id === updated._id);
        if (idx >= 0) state.items[idx] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      // toggle like
      .addCase(toggleTemplateLike.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t._id === updated._id);
        if (idx >= 0) state.items[idx] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      });
  },
});

export const { setFilters, clearSelected } = templatesSlice.actions;

// Selectors
export const selectTemplates = (state: RootState) => state.templates.items;
export const selectTemplatesLoading = (state: RootState) => state.templates.loading;
export const selectTemplatesError = (state: RootState) => state.templates.error;
export const selectTemplateSelected = (state: RootState) => state.templates.selected;
export const selectTemplateFilters = (state: RootState) => state.templates.filters;

export default templatesSlice.reducer;
