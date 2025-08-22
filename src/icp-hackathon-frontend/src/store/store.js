import { create } from "zustand";
import { chatApiService } from "../common/services/chatApiService.js";
import { chatWebSocketService } from "../common/services/chatWebSocketService.js";
import { canisterId } from "../../../declarations/icp-hackathon-backend/index.js";

const useStore = create(set => ({
	user: null,
	setUser: user => set({ user, loadingUser: false, userCreating: false }),
	addFavorite: listingId => set(state => ({ user: { ...state.user, favorites: [...state.user.favorites, listingId] } })),

	loadingUser: false,
	setUserLoading: () => set({ loadingUser: true }),

	userCreating: false,
	setUserCreating: creating => set({ userCreating: creating }),

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

	// Authentication initialization state
	authInitialized: false,
	setAuthInitialized: initialized => set({ authInitialized: initialized }),

	// Chat state
	conversations: {},
	activeConversationId: null,
	chatInitialized: false,
	chatLoading: false,
	chatError: null,

	// Initialize chat services
	initializeChat: async canisterId => {
		set({ chatLoading: true, chatError: null });

		try {
			// Get current identity
			const state = useStore.getState();
			const identity = state.identity;

			if (!identity) {
				throw new Error("User must be authenticated to use chat");
			}

			// Initialize API service with identity
			await chatApiService.initialize(canisterId, identity);

			// Skip WebSocket initialization for now - not needed for basic chat functionality
			console.log("Chat API initialized successfully (WebSocket disabled for simplicity)");

			// Load initial conversations
			const conversations = await chatApiService.getUserConversations();
			const conversationsMap = conversations.reduce((acc, conv) => {
				acc[conv.id] = {
					...conv,
					lastMessage: conv.messages[conv.messages.length - 1] || null,
					lastMessageTime: conv.last_message_time
						? new Date(Number(conv.last_message_time) / 1000000).toISOString()
						: null,
					createdAt: new Date(Number(conv.created_at) / 1000000).toISOString(),
					unreadCount: conv.unread_counts[useStore.getState().user?.id] || 0,
					otherUserId: conv.participants.find(p => p !== useStore.getState().user?.id)
				};
				return acc;
			}, {});

			set({
				conversations: conversationsMap,
				chatInitialized: true,
				chatLoading: false
			});
		} catch (error) {
			console.error("Failed to initialize chat:", error);
			set({
				chatError: error.message,
				chatLoading: false
			});
		}
	},

	setActiveConversation: conversationId => set({ activeConversationId: conversationId }),

	addConversation: conversation =>
		set(state => ({
			conversations: { ...state.conversations, [conversation.id]: conversation }
		})),

	updateConversationFromMessage: (conversationId, message) =>
		set(state => {
			const conversation = state.conversations[conversationId];
			if (!conversation) return state;

			// Convert backend message format to frontend format
			const frontendMessage = {
				id: message.id,
				senderId: message.sender_id,
				content: message.content,
				type: message.message_type,
				timestamp: new Date(Number(message.timestamp) / 1000000).toISOString(),
				read: message.read
			};

			const updatedConversation = {
				...conversation,
				messages: [...conversation.messages, frontendMessage],
				lastMessage: frontendMessage,
				lastMessageTime: frontendMessage.timestamp,
				unreadCount: conversation.unreadCount + (frontendMessage.senderId !== state.user?.id ? 1 : 0)
			};

			return {
				conversations: { ...state.conversations, [conversationId]: updatedConversation }
			};
		}),

	addMessage: async (conversationId, message) => {
		try {
			// Send via backend API (this will also trigger WebSocket broadcast)
			await chatApiService.sendMessage(conversationId, message.content);

			// The message will be added to the conversation via WebSocket event
			// No need to update local state manually here
		} catch (error) {
			console.error("Failed to send message:", error);
			// TODO: Add error handling UI
		}
	},

	markConversationAsRead: async conversationId => {
		try {
			await chatApiService.markConversationAsRead(conversationId);

			set(state => {
				const conversation = state.conversations[conversationId];
				if (!conversation) return state;

				return {
					conversations: {
						...state.conversations,
						[conversationId]: { ...conversation, unreadCount: 0 }
					}
				};
			});
		} catch (error) {
			console.error("Failed to mark conversation as read:", error);
		}
	},

	updateTypingStatus: (conversationId, userId, isTyping) =>
		set(state => {
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
		}),

	sendTypingStatus: async (conversationId, isTyping) => {
		try {
			// Send typing status via WebSocket for real-time updates
			await chatWebSocketService.sendTypingStatus(conversationId, isTyping);
		} catch (error) {
			console.error("Failed to send typing status:", error);
		}
	},

	createConversation: async (listingId, listingTitle) => {
		try {
			// Ensure chat is initialized
			const state = useStore.getState();
			if (!state.chatInitialized) {
				console.log("Chat not initialized, initializing now...");
				// Initialize chat with the backend canister ID
				await state.initializeChat(canisterId);
			}

			console.log("Creating conversation:", { listingId, listingTitle });

			const conversation = await chatApiService.createConversation(listingId);
			console.log("Backend returned conversation:", conversation);

			// Convert backend conversation format to frontend format
			const enhancedConversation = {
				id: conversation.id,
				participants: conversation.participants,
				listingId: conversation.listing_id,
				listingTitle: conversation.listing_title,
				messages: conversation.messages.map(msg => ({
					id: msg.id,
					senderId: msg.sender_id,
					content: msg.content,
					type: msg.message_type,
					timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString(),
					read: msg.read
				})),
				lastMessage:
					conversation.messages.length > 0
						? {
								id: conversation.messages[conversation.messages.length - 1].id,
								senderId: conversation.messages[conversation.messages.length - 1].sender_id,
								content: conversation.messages[conversation.messages.length - 1].content,
								type: conversation.messages[conversation.messages.length - 1].message_type,
								timestamp: new Date(
									Number(conversation.messages[conversation.messages.length - 1].timestamp) / 1000000
								).toISOString(),
								read: conversation.messages[conversation.messages.length - 1].read
						  }
						: null,
				lastMessageTime: conversation.last_message_time
					? new Date(Number(conversation.last_message_time) / 1000000).toISOString()
					: null,
				createdAt: new Date(Number(conversation.created_at) / 1000000).toISOString(),
				unreadCount: conversation.unread_counts?.[useStore.getState().user?.id] || 0,
				typingUsers: {},
				otherUserId: conversation.participants.find(p => p !== useStore.getState().user?.id) || otherUserId
			};

			console.log("Enhanced conversation:", enhancedConversation);

			set(state => ({
				conversations: { ...state.conversations, [conversation.id]: enhancedConversation }
			}));

			return conversation.id;
		} catch (error) {
			console.error("Failed to create conversation:", error);
			throw error;
		}
	},

	// Helper function to reload conversations
	loadConversations: async () => {
		try {
			const conversations = await chatApiService.getUserConversations();
			const conversationsMap = conversations.reduce((acc, conv) => {
				acc[conv.id] = {
					...conv,
					lastMessage: conv.messages[conv.messages.length - 1] || null,
					lastMessageTime:
						conv.messages.length > 0
							? new Date(Number(conv.messages[conv.messages.length - 1].timestamp) / 1000000).toISOString()
							: null,
					createdAt: new Date(Number(conv.created_at) / 1000000).toISOString(),
					unreadCount: conv.unread_counts?.[useStore.getState().user?.id] || 0,
					typingUsers: {},
					otherUserId: conv.participants.find(p => p !== useStore.getState().user?.id) || "unknown"
				};
				return acc;
			}, {});

			set({ conversations: conversationsMap });
		} catch (error) {
			console.error("Failed to load conversations:", error);
		}
	}
}));

export default useStore;
