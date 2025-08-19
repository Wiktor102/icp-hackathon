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
	setIdentity: identity => set({ identity }),

	// Chat state
	conversations: {},
	activeConversationId: null,
	setActiveConversation: conversationId => set({ activeConversationId: conversationId }),
	addConversation: conversation => set(state => ({
		conversations: { ...state.conversations, [conversation.id]: conversation }
	})),
	addMessage: (conversationId, message) => set(state => {
		const conversation = state.conversations[conversationId];
		if (!conversation) return state;
		
		const updatedConversation = {
			...conversation,
			messages: [...conversation.messages, message],
			lastMessage: message,
			lastMessageTime: message.timestamp,
			unreadCount: conversation.unreadCount + (message.senderId !== state.user?.id ? 1 : 0)
		};
		
		return {
			conversations: { ...state.conversations, [conversationId]: updatedConversation }
		};
	}),
	markConversationAsRead: conversationId => set(state => {
		const conversation = state.conversations[conversationId];
		if (!conversation) return state;
		
		return {
			conversations: {
				...state.conversations,
				[conversationId]: { ...conversation, unreadCount: 0 }
			}
		};
	}),
	updateTypingStatus: (conversationId, userId, isTyping) => set(state => {
		const conversation = state.conversations[conversationId];
		if (!conversation) return state;
		
		const typingUsers = { ...conversation.typingUsers };
		if (isTyping) {
			typingUsers[userId] = true;
		} else {
			delete typingUsers[userId];
		}
		
		return {
			conversations: {
				...state.conversations,
				[conversationId]: { ...conversation, typingUsers }
			}
		};
	})
}));

export default useStore;
