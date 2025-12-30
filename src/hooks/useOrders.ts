import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, SelectedExtra, Product } from '@/types/database';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Json } from '@/integrations/supabase/types';

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

      // Consider the latest order that is still in progress (open) or awaiting finalization (paid)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', tableId)
        .in('status', ['open', 'paid'])
        .order('created_at', { ascending: false })
        .limit(1)
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

export interface OrderItemWithProduct extends Omit<OrderItem, 'product'> {
  product: Product;
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
      
      return (data ?? []).map(item => ({
        ...item,
        selected_extras: (item.selected_extras as unknown as SelectedExtra[]) ?? [],
        product: item.product ? {
          ...item.product,
          extras: (item.product.extras as unknown as { name: string; price: number }[]) ?? []
        } : undefined
      })) as OrderItemWithProduct[];
    },
    enabled: !!orderId,
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      order_id: string;
      product_id: string;
      quantity: number;
      selected_extras: SelectedExtra[];
      base_price_at_order: number;
      unit_price: number;
      total_price: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          selected_extras: item.selected_extras as unknown as Json,
          base_price_at_order: item.base_price_at_order,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes,
        })
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
    mutationFn: async ({ id, quantity, total_price }: { id: string; quantity: number; total_price: number }) => {
      const { data, error } = await supabase
        .from('order_items')
        .update({ quantity, total_price })
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
