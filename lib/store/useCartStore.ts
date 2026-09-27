import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  slug: string;
  size: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem, quantity = 1) => {
        set((state) => {
          const idx = state.items.findIndex((i) => i.variantId === newItem.variantId);
          if (idx > -1) {
            const updated = [...state.items];
            const current = updated[idx];
            const updatedQty = Math.min(current.quantity + quantity, current.maxStock);
            updated[idx] = { ...current, quantity: updatedQty };
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              { ...newItem, quantity: Math.min(quantity, newItem.maxStock) },
            ],
          };
        });
      },
      removeItem: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      updateQuantity: (variantId, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.variantId === variantId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.maxStock) } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: 'antigravity-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
