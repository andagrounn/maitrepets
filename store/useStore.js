import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      _hasHydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // Create flow state
      uploadedUrl: null,
      generatedUrl: null,
      selectedStyle: 'oil',
      imageId: null,
      isUploading: false,
      isGenerating: false,

      setUploadedUrl: (url) => set({ uploadedUrl: url }),
      setGeneratedUrl: (url) => set({ generatedUrl: url }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),
      setImageId: (id) => set({ imageId: id }),
      setIsUploading: (v) => set({ isUploading: v }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      resetCreate: () => set({ uploadedUrl: null, generatedUrl: null, imageId: null, isUploading: false, isGenerating: false }),
    }),
    {
      name: 'maitrepets-store',
      partialize: (s) => ({ user: s.user, imageId: s.imageId }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
