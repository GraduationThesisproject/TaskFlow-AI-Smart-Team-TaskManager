import { useCallback, useMemo, useEffect } from 'react';
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
  listAllTemplates,
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

  useEffect(() => {
    // Log the list of templates whenever it changes
    console.log('Templates list:', items);
  }, [items]);

  const load = useCallback((f?: TemplatesFilters) => {
    const params = f ?? filters;
    dispatch(listTemplates(params) as any);
  }, [dispatch, filters]);

  const loadAll = useCallback((f?: TemplatesFilters) => {
    const params = f ?? filters;
    dispatch(listAllTemplates(params) as any);
  }, [dispatch, filters]);

  const fetchOne = useCallback((id: string) => {
    dispatch(getTemplate(id) as any);
  }, [dispatch]);

  const create = useCallback(async (payload: Partial<TemplateItem>) => {
    await dispatch(createTemplate(payload) as any).unwrap();
  }, [dispatch]);

  const update = useCallback(async (id: string, updates: Partial<TemplateItem>) => {
    await dispatch(updateTemplate({ id, updates }) as any).unwrap();
  }, [dispatch]);

  const remove = useCallback(async (id: string) => {
    await dispatch(deleteTemplate(id) as any).unwrap();
  }, [dispatch]);

  const updateFilters = useCallback((patch: Partial<TemplatesFilters>) => {
    dispatch(setFilters(patch));
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearSelected());
  }, [dispatch]);

  const incrementViews = useCallback((id: string) => {
    if (!id || id.length !== 24) {
      if (env.ENABLE_DEBUG) console.warn('incrementViews: invalid id, skipping', id);
      return;
    }
    (dispatch(incrementTemplateViews(id) as any).unwrap() as Promise<any>)
      .catch(() => {
        // Swallow 404s to avoid noisy errors when item no longer exists
      });
  }, [dispatch]);

  const toggleLike = useCallback((id: string) => {
    if (!id || id.length !== 24) {
      return;
    }
    // Ensure the ID exists in current store to avoid 404 from stale items
    const exists = Array.isArray(items) && items.some((t) => (t as any)?.id === id);
    if (!exists) {
      dispatch(listTemplates(filters) as any);
      return;
    }
    (dispatch(toggleTemplateLike(id) as any).unwrap() as Promise<any>)
      .catch((err: any) => {
        const msg = err?.message || String(err);
        if (/404|not found/i.test(msg)) {
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
    loadAll,
    fetchOne,
    create,
    update,
    remove,
    updateFilters,
    clearSelection,
    incrementViews,
    toggleLike,
  }), [items, selected, loading, error, filters, load, loadAll, fetchOne, create, update, remove, updateFilters, clearSelection, incrementViews, toggleLike]);
};
