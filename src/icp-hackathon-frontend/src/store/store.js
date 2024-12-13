import { create } from "zustand";

const useStore = create(set => ({
	user: null,
	setUser: user => set({ user, loadingUser: false }),

	loadingUser: false,
	setUserLoading: () => set({ loadingUser: true }),

	categories: null,
	setCategories: categories => set({ categories })
}));

export default useStore;
