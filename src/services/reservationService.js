import api from './api';

export const getReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};
