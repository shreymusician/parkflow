import api from './api';

export const getSessions = async () => {
  const response = await api.get('/sessions');
  return response.data;
};

export const startSession = async (reservationId) => {
  const response = await api.post('/sessions/start', { reservationId });
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.post('/sessions/end', { sessionId });
  return response.data;
};
