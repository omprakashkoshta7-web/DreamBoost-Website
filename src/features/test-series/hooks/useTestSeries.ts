import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectTests, selectTestLoading, selectTestError, selectTestPagination } from '../store/test.selectors';
import { fetchTests as fetchTestsThunk } from '../store/test.thunks';

export const useTestSeries = () => {
  const dispatch = useAppDispatch();
  const tests = useAppSelector(selectTests);
  const loading = useAppSelector(selectTestLoading);
  const error = useAppSelector(selectTestError);
  const pagination = useAppSelector(selectTestPagination);

  const [filters, setFilters] = useState<{ category?: string; subject?: string; difficulty?: string; search?: string; testType?: string; page?: number; limit?: number }>({ page: 1, limit: 500, testType: 'full' });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    dispatch(fetchTestsThunk(filters));
  }, []);

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    tests.forEach((test: any) => { if (test.category) catSet.add(test.category); });
    return Array.from(catSet);
  }, [tests]);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value, page: key === 'page' ? value : 1 };
      filtersRef.current = next;
      dispatch(fetchTestsThunk(next));
      return next;
    });
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchTestsThunk(filtersRef.current));
  }, [dispatch]);

  return { tests, categories, filters, loading, error, pagination, setFilter, refresh };
};
