export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  ml: number;
  gender: string;
  family: string;
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  description: string;
  images: string[];
  rating_avg: number;
  rating_count: number;
  in_stock_label: string;
  featured: boolean;
  best_seller: boolean;
}

export interface CartItem {
  slug: string;
  name: string;
  ml: number;
  qty: number;
  unitPrice: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
}

export interface Filter {
  brands: string[];
  families: string[];
  priceRange: {
    min: number;
    max: number;
  };
}
