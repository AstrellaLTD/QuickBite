// ─── User & Auth Types ─────────────────────────────────────
export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Menu Types ────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  category?: Category;
  customizations?: ItemCustomization[];
}

export interface ItemCustomization {
  id: string;
  menuItemId: string;
  name: string;
  type: 'RADIO' | 'CHECKBOX';
  isRequired: boolean;
  sortOrder: number;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  customizationId: string;
  label: string;
  priceModifier: number;
  sortOrder: number;
}

// ─── Cart Types ────────────────────────────────────────────
export interface CartItem {
  id: string; // Unique cart line ID
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions: string;
  itemTotal: number;
}

export interface SelectedCustomization {
  customizationId: string;
  customizationName: string;
  optionId: string;
  optionLabel: string;
  priceModifier: number;
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
  guestAddress: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: { name: string; email: string; phone: string | null };
  driver?: { name: string; phone: string | null };
  address?: Address;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions: string | null;
  selectedCustomizations: string | null;
  itemTotal: number;
  menuItem?: MenuItem;
}

// ─── Address Types ─────────────────────────────────────────
export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

// ─── Deal Types ────────────────────────────────────────────
export interface Deal {
  id: string;
  name: string;
  description: string | null;
  dealPrice: number;
  isActive: boolean;
  items: DealItem[];
}

export interface DealItem {
  id: string;
  dealId: string;
  menuItemId: string;
  menuItem?: MenuItem;
}

// ─── API Response Types ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
