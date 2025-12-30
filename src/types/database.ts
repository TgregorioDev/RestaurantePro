export type TableStatus = 'available' | 'in_service';
export type OrderStatus = 'open' | 'paid' | 'closed';

export interface ProductExtra {
  name: string;
  price: number;
}

export interface Table {
  id: string;
  identifier: string;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  extras: ProductExtra[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface SelectedExtra {
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  selected_extras: SelectedExtra[];
  base_price_at_order: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}
