import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, MenuItem, SelectedCustomization } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  subtotal: number;
  
  // Actions
  addItem: (
    menuItem: MenuItem,
    quantity: number,
    customizations: SelectedCustomization[],
    specialInstructions: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  getCartCount: () => number;
}

const calculateItemTotal = (basePrice: number, customizations: SelectedCustomization[], quantity: number) => {
  const modsTotal = customizations.reduce((acc, current) => acc + current.priceModifier, 0);
  return (basePrice + modsTotal) * quantity;
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.itemTotal, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,

      addItem: (menuItem, quantity, customizations, specialInstructions) => {
        set((state) => {
          // Check if an identical item is already in the cart (same item + same customizations)
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.menuItem.id === menuItem.id &&
              JSON.stringify(item.selectedCustomizations) === JSON.stringify(customizations) &&
              item.specialInstructions === specialInstructions
          );

          let newItems = [...state.items];

          if (existingItemIndex > -1) {
            // Update quantity of existing item
            const existing = newItems[existingItemIndex];
            const newQuantity = existing.quantity + quantity;
            newItems[existingItemIndex] = {
              ...existing,
              quantity: newQuantity,
              itemTotal: calculateItemTotal(menuItem.price, customizations, newQuantity),
            };
          } else {
            // Add new line item
            newItems.push({
              id: uuidv4(),
              menuItem,
              quantity,
              selectedCustomizations: customizations,
              specialInstructions,
              itemTotal: calculateItemTotal(menuItem.price, customizations, quantity),
            });
          }

          return {
            items: newItems,
            subtotal: calculateSubtotal(newItems),
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== cartItemId);
          return {
            items: newItems,
            subtotal: calculateSubtotal(newItems),
          };
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
                itemTotal: calculateItemTotal(
                  item.menuItem.price,
                  item.selectedCustomizations,
                  quantity
                ),
              };
            }
            return item;
          });

          return {
            items: newItems,
            subtotal: calculateSubtotal(newItems),
          };
        });
      },

      clearCart: () => {
        set({ items: [], subtotal: 0 });
      },

      getCartCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'quickbite-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
