import { useCallback, useMemo } from 'react';
import { env } from '../config/env';
import { useAppDispatch, useAppSelector } from '../store';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setFilters,
  clearSelected,
  selectTemplates,
  selectTemplatesLoading,
  selectTemplatesError,
  selectTemplateSelected,
  selectTemplateFilters,
  incrementTemplateViews,
  toggleTemplateLike,
} from '../store/slices/templatesSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import type { TemplatesFilters, TemplateItem } from '../types/dash.types';
import type { UseTemplatesReturn } from '../types/dash.types';



export const useTemplates = (): UseTemplatesReturn => {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectTemplates);
  const loading = useAppSelector(selectTemplatesLoading);
  const error = useAppSelector(selectTemplatesError);
  const selected = useAppSelector(selectTemplateSelected);
  const filters = useAppSelector(selectTemplateFilters);
  const isAuthenticated = useAppSelector(selectIsAuthenticated as any);

  const load = useCallback((f?: TemplatesFilters) => {
    const params = f ?? filters;
    if (!isAuthenticated) {
      if (env.ENABLE_DEBUG) console.log('⏭️ Skipping templates load: not authenticated');
      return;
    }
    if (env.ENABLE_DEBUG) console.log('📄 Loading templates with filters:', params);
    dispatch(listTemplates(params) as any);
  }, [dispatch, filters, isAuthenticated]);

  const fetchOne = useCallback((id: string) => {
    if (env.ENABLE_DEBUG) console.log('📄 Fetching template:', id);
    dispatch(getTemplate(id) as any);
  }, [dispatch]);

  const create = useCallback(async (payload: Partial<TemplateItem>) => {
    if (env.ENABLE_DEBUG) console.log('➕ Creating template');
    await dispatch(createTemplate(payload) as any).unwrap();
  }, [dispatch]);

  const update = useCallback(async (id: string, updates: Partial<TemplateItem>) => {
    if (env.ENABLE_DEBUG) console.log('✏️ Updating template:', id);
    await dispatch(updateTemplate({ id, updates }) as any).unwrap();
  }, [dispatch]);

  const remove = useCallback(async (id: string) => {
    if (env.ENABLE_DEBUG) console.log('🗑️ Deleting template:', id);
    await dispatch(deleteTemplate(id) as any).unwrap();
  }, [dispatch]);

  const updateFilters = useCallback((patch: Partial<TemplatesFilters>) => {
    if (env.ENABLE_DEBUG) console.log('⚙️ Updating template filters:', patch);
    dispatch(setFilters(patch));
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    if (env.ENABLE_DEBUG) console.log('🧹 Clearing selected template');
    dispatch(clearSelected());
  }, [dispatch]);

  const incrementViews = useCallback((id: string) => {
    if (!id || id.length !== 24) {
      if (env.ENABLE_DEBUG) console.warn('incrementViews: invalid id, skipping', id);
      return;
    }
    if (env.ENABLE_DEBUG) console.log('👀 Incrementing template views:', id);
    (dispatch(incrementTemplateViews(id) as any).unwrap() as Promise<any>)
      .catch((err: any) => {
        // Swallow 404s to avoid noisy errors when item no longer exists
        if (env.ENABLE_DEBUG) console.warn('incrementViews failed (likely 404), ignoring', err?.message || err);
      });
  }, [dispatch]);

  const toggleLike = useCallback((id: string) => {
    if (!id || id.length !== 24) {
      if (env.ENABLE_DEBUG) console.warn('toggleLike: invalid id, skipping', id);
      return;
    }
    // Ensure the ID exists in current store to avoid 404 from stale items
    const exists = Array.isArray(items) && items.some((t) => (t as any)?._id === id);
    if (!exists) {
      if (env.ENABLE_DEBUG) console.warn('toggleLike: id not in current store, refreshing list', id);
      dispatch(listTemplates(filters) as any);
      return;
    }
    if (env.ENABLE_DEBUG) console.log('❤️ Toggling like for template:', id);
    (dispatch(toggleTemplateLike(id) as any).unwrap() as Promise<any>)
      .catch((err: any) => {
        const msg = err?.message || String(err);
        if (/404|not found/i.test(msg)) {
          if (env.ENABLE_DEBUG) console.warn('toggleLike: template not found, refreshing list');
          dispatch(listTemplates(filters) as any);
        } else if (env.ENABLE_DEBUG) {
          console.warn('toggleLike failed, ignoring', msg);
        }
      });
   }, [dispatch, items, filters]);

  return useMemo(() => ({
    items,
    selected,
    loading,
    error,
    filters,

    load,
    fetchOne,
    create,
    update,
    remove,
    updateFilters,
    clearSelection,
    incrementViews,
    toggleLike,
  }), [items, selected, loading, error, filters, load, fetchOne, create, update, remove, updateFilters, clearSelection, incrementViews, toggleLike]);
};
