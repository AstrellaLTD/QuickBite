import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, SelectedVariation, SelectedOption, SelectedExtra } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  subtotal: number;

  addItem: (
    product: Product,
    quantity: number,
    selectedVariation: SelectedVariation | null,
    selectedOptions: SelectedOption[],
    selectedExtras: SelectedExtra[],
    specialInstructions: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

function calcItemTotal(
  product: Product,
  variation: SelectedVariation | null,
  options: SelectedOption[],
  extras: SelectedExtra[],
  qty: number
): number {
  const base = variation ? variation.price : product.basePrice;
  const optionsTotal = options.reduce((sum, o) => sum + o.priceAdd, 0);
  const extrasTotal = extras.reduce((sum, e) => sum + e.priceAdd, 0);
  return (base + optionsTotal + extrasTotal) * qty;
}

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.itemTotal, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,

      addItem: (product, quantity, selectedVariation, selectedOptions, selectedExtras, specialInstructions) => {
        set((state) => {
          // Check if identical item already in cart
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedVariation?.variationId === selectedVariation?.variationId &&
              JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions) &&
              JSON.stringify(item.selectedExtras) === JSON.stringify(selectedExtras) &&
              item.specialInstructions === specialInstructions
          );

          const newItems = [...state.items];

          if (existingIndex > -1) {
            const existing = newItems[existingIndex];
            const newQty = existing.quantity + quantity;
            newItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              itemTotal: calcItemTotal(product, selectedVariation, selectedOptions, selectedExtras, newQty),
            };
          } else {
            newItems.push({
              id: uuidv4(),
              product,
              quantity,
              selectedVariation,
              selectedOptions,
              selectedExtras,
              specialInstructions,
              itemTotal: calcItemTotal(product, selectedVariation, selectedOptions, selectedExtras, quantity),
            });
          }

          return { items: newItems, subtotal: calcSubtotal(newItems) };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== cartItemId);
          return { items: newItems, subtotal: calcSubtotal(newItems) };
        });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === cartItemId) {
              return {
                ...item,
                quantity,
                itemTotal: calcItemTotal(item.product, item.selectedVariation, item.selectedOptions, item.selectedExtras, quantity),
              };
            }
            return item;
          });
          return { items: newItems, subtotal: calcSubtotal(newItems) };
        });
      },

      clearCart: () => set({ items: [], subtotal: 0 }),

      getCartCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'hibafood-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
