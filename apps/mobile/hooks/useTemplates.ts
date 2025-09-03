
import { useCallback, useMemo, useRef } from 'react';
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
  toggleTemplateLike,
  listAllTemplates,
  toggleLikeLocal,
  incrementTemplateViews,
} from '../store/slices/templatesSlice';
import { selectUserBasic } from '../store/slices/authSlice';
import type { TemplatesFilters, TemplateItem } from '../types/dash.types';
import type { UseTemplatesReturn } from '../types/dash.types';
import type { UserBasic } from '../types/auth.types';



export const useTemplates = (): UseTemplatesReturn => {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectTemplates);
  const loading = useAppSelector(selectTemplatesLoading);
  const error = useAppSelector(selectTemplatesError);
  const selected = useAppSelector(selectTemplateSelected);
  const filters = useAppSelector(selectTemplateFilters);
  const userBasic = useAppSelector(selectUserBasic) as UserBasic | undefined;

  // Track in-flight like toggles per template to avoid duplicate POSTs
  const likeInFlightRef = useRef<Set<string>>(new Set());

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

  // Views are incremented uniquely by backend on GET /templates/:id
  const incrementViews = useCallback((id: string) => {
    // Alias to fetchOne: backend increments views on GET /templates/:id
    if (!id) return;
    dispatch(incrementTemplateViews(id) as any);
  }, [dispatch]);

  const toggleLike = useCallback((id: string) => {
    // Accept any non-empty id; backend will validate format. This avoids blocking toggles
    // when ids are not 24-char hex.
    if (!id) return;
    // Prevent duplicate requests while one is in-flight for this id
    if (likeInFlightRef.current.has(id)) return;
    const userId: string | undefined = userBasic?._id || (userBasic as any)?.id;
    if (!userId) return;
    if (env.ENABLE_DEBUG) {
      const before = Array.isArray(items) ? (items as any[]).find((t) => t?._id === id) : undefined;
      console.debug('[toggleLike] before', {
        id,
        likes: before?.likes,
        likedByLen: Array.isArray(before?.likedBy) ? before.likedBy.length : undefined,
        hasUser: Array.isArray(before?.likedBy) ? before.likedBy.some((e: any) => String(e?._id ?? e) === String(userId)) : undefined,
      });
    }
    // Optimistic update
    dispatch(toggleLikeLocal({ id, userId }));
    if (env.ENABLE_DEBUG) {
      const afterOpt = Array.isArray(items) ? (items as any[]).find((t) => t?._id === id) : undefined;
      console.debug('[toggleLike] after optimistic', {
        id,
        likes: afterOpt?.likes,
        likedByLen: Array.isArray(afterOpt?.likedBy) ? afterOpt.likedBy.length : undefined,
        hasUser: Array.isArray(afterOpt?.likedBy) ? afterOpt.likedBy.some((e: any) => String(e?._id ?? e) === String(userId)) : undefined,
      });
    }
    // Mark as in-flight before hitting the server
    likeInFlightRef.current.add(id);
    (dispatch(toggleTemplateLike({ id, userId }) as any).unwrap() as Promise<any>)
      .then((payload: any) => {
        if (env.ENABLE_DEBUG) {
          const afterFulfilled = Array.isArray((items as any)) ? (items as any[]).find((t) => t?._id === id) : undefined;
          console.debug('[toggleLike] fulfilled', {
            id,
            serverLikes: typeof payload?.likes === 'number' ? payload.likes : undefined,
            likes: afterFulfilled?.likes,
            likedByLen: Array.isArray(afterFulfilled?.likedBy) ? afterFulfilled.likedBy.length : undefined,
            hasUser: Array.isArray(afterFulfilled?.likedBy) ? afterFulfilled.likedBy.some((e: any) => String(e?._id ?? e) === String(userId)) : undefined,
          });
        }
      })
      .catch((err: any) => {
        // Revert optimistic update on failure
        dispatch(toggleLikeLocal({ id, userId }));
        const msg = err?.message || String(err);
        if (/404|not found/i.test(msg)) {
          dispatch(listTemplates(filters) as any);
        } else if (env.ENABLE_DEBUG) {
          console.warn('toggleLike failed, reverted optimistic update', msg);
        }
      })
      .finally(() => {
        likeInFlightRef.current.delete(id);
      });
   }, [dispatch, items, filters, userBasic]);

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
