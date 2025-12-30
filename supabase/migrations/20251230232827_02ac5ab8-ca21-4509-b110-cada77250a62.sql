-- Products: Change extras from text[] to jsonb for storing name+price
ALTER TABLE public.products 
ADD COLUMN extras_json jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.products DROP COLUMN extras;

ALTER TABLE public.products RENAME COLUMN extras_json TO extras;

-- Order items: Add base_price_at_order for snapshot
ALTER TABLE public.order_items 
ADD COLUMN base_price_at_order numeric NOT NULL DEFAULT 0;

-- Order items: Change extras from text[] to jsonb for storing selected extras with prices
ALTER TABLE public.order_items 
ADD COLUMN selected_extras jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.order_items DROP COLUMN extras;

-- Update existing order_items to have base_price_at_order from unit_price
UPDATE public.order_items SET base_price_at_order = unit_price WHERE base_price_at_order = 0;