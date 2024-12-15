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
	deleteListing: listingId =>
		set(state => {
			const newListings = { ...state.listings };
			delete newListings[listingId];

			return {
				listings: newListings,
				userListings: state.userListings.filter(listing => listing.id != listingId)
			};
		}),
	addReview: (listingId, review) => {
		set(state => {
			const listing = state.listings[listingId];
			listing.reviews = [...listing.reviews, review];
			return { listings: { ...state.listings, [listingId]: listing } };
		});
	},

	userListings: [],
	userListingsLoading: false,
	userListingsError: null,
	setUserListings: listings => set({ userListings: listings, userListingsLoading: false, userListingsError: null }),
	addUserListings: (...newListings) => set(state => ({ userListings: [...state.userListings, ...newListings] })),
	setUserListingsLoading: () => set({ userListingsLoading: true }),
	setUserListingsError: error => set({ userListingsError: error, userListingsLoading: false }),

	imageCache: {},
	addImageToCache: (id, imageData) =>
		set(state => ({
			imageCache: { ...state.imageCache, [id]: imageData }
		})),
	getImageFromCache: id => {
		const state = useStore.getState();
		return state.imageCache[id];
	},

	authClient: null,
	setAuthClient: authClient => set({ authClient }),
	identity: null,
	setIdentity: identity => set({ identity })
}));

export default useStore;
