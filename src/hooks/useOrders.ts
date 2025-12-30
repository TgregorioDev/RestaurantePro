import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/database';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useOrders(tableId?: string) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', tableId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*');
      
      if (tableId) {
        query = query.eq('table_id', tableId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });

  const activeOrderQuery = useQuery({
    queryKey: ['active-order', tableId],
    queryFn: async () => {
      if (!tableId) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', tableId)
        .eq('status', 'open')
        .maybeSingle();
      
      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!tableId,
  });

  const createOrder = useMutation({
    mutationFn: async (tableId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({ table_id: tableId, status: 'open', total: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['active-order'] });
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido: ' + error.message);
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['active-order'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    },
  });

  const updateOrderTotal = useMutation({
    mutationFn: async ({ id, total }: { id: string; total: number }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ total })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['active-order'] });
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['active-order'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    orders: ordersQuery.data ?? [],
    activeOrder: activeOrderQuery.data,
    isLoading: ordersQuery.isLoading || activeOrderQuery.isLoading,
    createOrder,
    updateOrderStatus,
    updateOrderTotal,
  };
}

export function useOrderItems(orderId?: string) {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId)
        .order('created_at');
      
      if (error) throw error;
      return data as (OrderItem & { product: { id: string; name: string; price: number; extras: string[] } })[];
    },
    enabled: !!orderId,
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      order_id: string;
      product_id: string;
      quantity: number;
      extras: string[];
      unit_price: number;
      total_price: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('order_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-items'] });
      toast.success('Produto adicionado!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar produto: ' + error.message);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrderItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-items'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar item: ' + error.message);
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-items'] });
      toast.success('Item removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover item: ' + error.message);
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['order-items', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    addItem,
    updateItem,
    removeItem,
  };
}
