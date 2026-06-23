import apiClient from '@shared/utils/apiClient';

export const fetchTests = async (params: { category?: string; subject?: string; difficulty?: string; search?: string; testType?: string; page?: number; limit?: number }) => {
  const response = await apiClient.get('/tests', { params });
  return response.data.data;
};

export const fetchTest = async (testId: string) => {
  const response = await apiClient.get(`/tests/${testId}`);
  return response.data.data;
};

export const submitTest = async (testId: string, data: { answers: Record<string, number>; timeTaken: number; startedAt: string; completedAt: string }) => {
  const response = await apiClient.post(`/tests/${testId}/submit`, data);
  return response.data.data;
};

export const fetchCompletedCategories = async (): Promise<string[]> => {
  const response = await apiClient.get('/tests/completed-categories');
  return response.data.data.categories;
};

export const enrollTest = async (testId: string) => {
  if (!testId) throw new Error('Test ID is missing');
  const response = await apiClient.post('/tests/enroll', { testId });
  return response.data.data;
};

export const fetchMyEnrollments = async (): Promise<string[]> => {
  const response = await apiClient.get('/tests/my');
  return response.data.data.tests.map((t: any) => t._id);
};
