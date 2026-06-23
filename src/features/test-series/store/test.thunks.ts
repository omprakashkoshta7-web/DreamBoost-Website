import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTests as fetchTestsApi, fetchTest as fetchTestApi, submitTest as submitTestApi, fetchCompletedCategories as fetchCompletedCategoriesApi } from '../services/api';

export const fetchTests = createAsyncThunk<any, { category?: string; subject?: string; difficulty?: string; search?: string; testType?: string; page?: number; limit?: number }, { rejectValue: string }>(
  'tests/fetchTests',
  async (params, { rejectWithValue }) => {
    try { return await fetchTestsApi(params); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests'); }
  }
);

export const fetchTest = createAsyncThunk<any, string, { rejectValue: string }>(
  'tests/fetchTest',
  async (testId, { rejectWithValue }) => {
    try { return await fetchTestApi(testId); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || 'Failed to fetch test'); }
  }
);

export const fetchCompletedCategories = createAsyncThunk<string[], void, { rejectValue: string }>(
  'tests/fetchCompletedCategories',
  async (_, { rejectWithValue }) => {
    try { return await fetchCompletedCategoriesApi(); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || 'Failed to fetch completed categories'); }
  }
);

export const submitTest = createAsyncThunk<any, { testId: string; answers: Record<string, number>; timeTaken: number; startedAt: string; completedAt: string }, { rejectValue: string }>(
  'tests/submitTest',
  async (params, { rejectWithValue }) => {
    try {
      const { testId, ...body } = params;
      return await submitTestApi(testId, body);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit test');
    }
  }
);
