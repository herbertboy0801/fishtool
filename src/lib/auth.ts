import { create } from "zustand";
import { store } from "./store";

interface AuthState {
  phone: string | null;
  plan: string;
  isLoggedIn: boolean;
  login: (phone: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  phone: null,
  plan: "free",
  isLoggedIn: false,

  login: (phone: string) => {
    store.set("userPhone", phone);
    store.set("userPlan", "free");
    store.set("userActivated", true);
    set({ phone, plan: "free", isLoggedIn: true });
  },

  logout: () => {
    store.remove("userPhone");
    store.remove("userPlan");
    store.remove("userActivated");
    set({ phone: null, plan: "free", isLoggedIn: false });
  },

  hydrate: () => {
    const phone = store.get<string | null>("userPhone", null);
    const plan = store.get<string>("userPlan", "free");
    if (phone) {
      set({ phone, plan, isLoggedIn: true });
    }
  },
}));
