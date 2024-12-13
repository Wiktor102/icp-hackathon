import { create } from "zustand";

const useStore = create(set => ({
	user: null,
	loadingUser: false,
	setUser: user => set({ user, loadingUser: false }),
	setUserLoading: () => set({ loadingUser: true })
}));

export default useStore;
