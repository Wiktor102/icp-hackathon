import { create } from "zustand";

const useStore = create(set => ({
	user: null,
	setUser: user => set({ user, loadingUser: false }),
	addFavorite: listingId => set(state => ({ user: { ...state.user, favorites: [...state.user.favorites, listingId] } })),

	loadingUser: false,
	setUserLoading: () => set({ loadingUser: true }),

	categories: null,
	setCategories: categories => set({ categories }),

	listings: {},
	addListings: (...newListings) => {
		newListings = newListings.reduce((acc, listing) => {
			acc[listing.id] = listing;
			return acc;
		}, {});

		return set(state => ({ listings: { ...state.listings, ...newListings } }));
	},
	addReview: (listingId, review) => {
		set(state => {
			const listing = state.listings[listingId];
			listing.reviews = [...listing.reviews, review];
			return { listings: { ...state.listings, [listingId]: listing } };
		});
	},

	userListings: [],
	setUserListings: listings => set({ userListings: listings })
}));

export default useStore;
