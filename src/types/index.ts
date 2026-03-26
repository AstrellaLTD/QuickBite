// ─── User & Auth Types ─────────────────────────────────────
export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Menu Types ────────────────────────────────────────────
export interface Subcategory {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface ProductVariation {
  id: string;
  name: string;   // "Junior", "Senior", "Mega"
  price: number;
  sortOrder: number;
}

export interface OptionChoice {
  id: string;
  name: string;
  priceAdd: number;
  sortOrder: number;
}

export interface RequiredOptionGroup {
  id: string;
  name: string;       // "Viande", "Sauces"
  maxSelect: number;
  sortOrder: number;
  choices: OptionChoice[];
}

export interface ProductExtra {
  id: string;
  name: string;
  priceAdd: number;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  subcategoryId: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  maxPrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isBestSeller: boolean;
  note: string | null;
  variations: ProductVariation[];
  optionGroups: RequiredOptionGroup[];
  extras: ProductExtra[];
}

// ─── Cart Types ────────────────────────────────────────────
export interface SelectedVariation {
  variationId: string;
  name: string;
  price: number;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceAdd: number;
}

export interface SelectedExtra {
  extraId: string;
  name: string;
  priceAdd: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariation: SelectedVariation | null;
  selectedOptions: SelectedOption[];
  selectedExtras: SelectedExtra[];
  specialInstructions: string;
  itemTotal: number;
}

// ─── Order Types ───────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  userId: string | null;
  driverId: string | null;
  addressId: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: { name: string; email: string; phone: string | null };
  driver?: { name: string; phone: string | null };
  address?: Address;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  specialInstructions: string | null;
  selectedVariation: string | null;
  selectedOptions: string | null;
  selectedExtras: string | null;
  unitPrice: number;
  itemTotal: number;
  product?: Product;
}

// ─── Address Types ─────────────────────────────────────────
export interface Address {
  id: string;
  userId: string | null;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
}

// ─── API Response Types ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
