import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// Menu hooks
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data } = await client.get('/menu');
      return data;
    },
  });
}

// Orders hooks
export function useOrders(options = {}) {
  return useQuery({
    queryKey: ['orders', options],
    queryFn: async () => {
      const { data } = await client.get('/orders', { params: options });
      return data;
    },
    refetchInterval: 5000, // Refetch setiap 5 detik untuk realtime
  });
}

export function useOrderDetail(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await client.get(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}

// Stock hooks
export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: async () => {
      const { data } = await client.get('/stock');
      return data;
    },
  });
}

// Dashboard hooks
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await client.get('/dashboard/summary');
      return data;
    },
  });
}

// Checkout mutation
export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkoutData) => {
      const { data } = await client.post('/cart/checkout', checkoutData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

// Payment mutation
export function usePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, paymentData }) => {
      const { data } = await client.post(`/orders/${orderId}/pay`, paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

// Stock mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stockData) => {
      const { data } = await client.post('/stock/update', stockData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
