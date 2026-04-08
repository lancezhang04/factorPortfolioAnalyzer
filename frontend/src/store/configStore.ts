import { create } from 'zustand';

interface ConfigStore {
  useCache: boolean;
  setUseCache: (useCache: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  useCache: true,  // Default to true for faster loading
  setUseCache: (useCache) => set({ useCache }),
  activeTab: 'holdings',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
