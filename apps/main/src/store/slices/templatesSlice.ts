import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import axiosInstance from '../../config/axios';
import type { PayloadAction } from '@reduxjs/toolkit';

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

// Global in-flight guard to prevent duplicate like POSTs per template id
const likeInFlight = new Set<string>();

// Thunks
export const listTemplates = createAsyncThunk(
  'templates/list',
  async (params: TemplatesFilters | undefined, { rejectWithValue }) => {
    try {
      const query = toQuery(params || {});
      const res = await axiosInstance.get<{ success: boolean; data: TemplateItem[] }>(`/templates${query}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load templates');
    }
  }
);

export const listAllTemplates = createAsyncThunk(
  'templates/listAll',
  async (params: TemplatesFilters | undefined, { rejectWithValue }) => {
    try {
      const merged = { ...(params || {}), scope: 'all' as const };
      const query = toQuery(merged as Record<string, any>);
      const res = await axiosInstance.get<{ success: boolean; data: TemplateItem[] }>(`/templates${query}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load templates (all)');
    }
  }
);

export const getTemplate = createAsyncThunk(
  'templates/get',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<{ success: boolean; data: TemplateItem }>(`/templates/${id}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load template');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (payload: Partial<TemplateItem>, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post<{ success: boolean; data: TemplateItem }>(`/templates`, payload);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, updates }: { id: string; updates: Partial<TemplateItem> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch<{ success: boolean; data: TemplateItem }>(`/templates/${id}`, updates);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to update template');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<{ success: boolean }>(`/templates/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to delete template');
    }
  }
);

export const toggleTemplateLike = createAsyncThunk(
  'templates/toggleLike',
  async (arg: { id: string; userId: string }, { getState, rejectWithValue }) => {
    try {
      const { id } = arg;
      if (!id) throw new Error('Missing template id');

      // If a request is already in-flight for this id, return current state snapshot to avoid extra POSTs
      if (likeInFlight.has(id)) {
        const state = getState() as any;
        const current = state.templates.items.find((t) => (t as any)._id === id) || state.templates.selected;
        return current as any;
      }

      likeInFlight.add(id);
      const res = await axiosInstance.post<{ success: boolean; data: TemplateItem }>(`/templates/${id}/like`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to toggle like');
    }
    finally {
      // Always clear in-flight guard
      try { likeInFlight.delete(arg.id); } catch {}
    }
  }
);

export const incrementTemplateViews = createAsyncThunk(
  'templates/incrementViews',
  async (id: string, { rejectWithValue }) => {
    try {
      // Backend increments views when fetching a single template
      const res = await axiosInstance.get<{ success: boolean; data: TemplateItem }>(`/templates/${id}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to increment views');
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
    // Optimistic like toggle: immediately flip like state for the current user
    toggleLikeLocal(
      state,
      action: PayloadAction<{ id: string; userId: string }>
    ) {
      const { id, userId } = action.payload;
      const applyToggle = (t: any) => {
        if (!t) return t;
        const arr = Array.isArray(t.likedBy) ? t.likedBy : [];
        // Determine representation type (string ids vs populated objects)
        const isObjArray = arr.some((e: any) => e && typeof e === 'object');
        const hasLiked = arr.some((e: any) => String(e?._id ?? e) === String(userId));

        if (hasLiked) {
          // Remove like
          t.likedBy = arr.filter((e: any) => String(e?._id ?? e) !== String(userId));
          if (typeof t.likes === 'number') t.likes = Math.max(0, t.likes - 1);
        } else {
          // Add like
          t.likedBy = isObjArray ? [...arr, { _id: userId }] : [...arr, userId];
          if (typeof t.likes === 'number') t.likes = t.likes + 1;
        }
        return t;
      };

      // Update in list
      const idx = state.items.findIndex((t) => t._id === id);
      if (idx >= 0) {
        state.items[idx] = applyToggle({ ...state.items[idx] });
      }
      // Update selected if same
      if (state.selected?._id === id) {
        state.selected = applyToggle({ ...state.selected });
      }
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
        // Keep the list in sync (update views/likes/etc.)
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
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
      // toggle like
      .addCase(toggleTemplateLike.fulfilled, (state, action) => {
        const updated = action.payload as any;
        const idx = state.items.findIndex((t) => t._id === updated._id);
        if (idx >= 0) state.items[idx] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      // increment views
      .addCase(incrementTemplateViews.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t._id === updated._id);
        if (idx >= 0) state.items[idx] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      ;
  },
});

export const { setFilters, clearSelected, toggleLikeLocal } = templatesSlice.actions;

// Selectors
export const selectTemplates = (state: any) => state.templates.items;
export const selectTemplatesLoading = (state: any) => state.templates.loading;
export const selectTemplatesError = (state: any) => state.templates.error;
export const selectTemplateSelected = (state: any) => state.templates.selected;
export const selectTemplateFilters = (state: any) => state.templates.filters;

export default templatesSlice.reducer;