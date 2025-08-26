import { create } from "zustand";
import { chatApiService } from "../common/services/chatApiService.js";
import { chatWebSocketService } from "../common/services/chatWebSocketService.js";

const useStore = create(set => ({
	user: null,
	setUser: user => set({ user, loadingUser: false, userCreating: false }),
	addFavorite: listingId =>
		set(state => ({ user: { ...state.user, favorites: [...(state.user.favorites ?? []), listingId] } })),

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

	// Chat state
	conversations: {},
	activeConversationId: null,
	chatInitialized: false,
	chatLoading: false,
	chatError: null,

	// Initialize chat services
	initializeChat: async () => {
		set({ chatLoading: true, chatError: null });

		try {
			// Check if chat services are already initialized
			if (!chatApiService.isInitialized()) {
				throw new Error("Chat API service not initialized. Make sure user is authenticated.");
			}

			// Set up WebSocket event handlers if WebSocket is available
			if (chatWebSocketService.isInitialized()) {
				console.log("Setting up WebSocket event handlers");

				chatWebSocketService.onMessage(data => {
					console.log("WebSocket message received:", data);
					const { conversationId, message } = data;

					// Add the message to the store, avoiding duplicates
					set(state => {
						const conversation = state.conversations[conversationId];
						if (!conversation) return state;

						// Check if message already exists (avoid duplicates)
						const existingMessageIndex = conversation.messages.findIndex(
							msg =>
								msg.id === message.id ||
								(msg.isOptimistic && msg.content === message.content && msg.sender_id === message.sender_id)
						);

						let updatedMessages;
						if (existingMessageIndex !== -1) {
							// Replace existing message (could be optimistic or duplicate)
							const existingMessage = conversation.messages[existingMessageIndex];
							console.log("Replacing existing message:", existingMessage, "with:", message);
							updatedMessages = [...conversation.messages];

							// If replacing an optimistic message, preserve content and merge with server data
							if (existingMessage.isOptimistic) {
								const mergedMessage = {
									...existingMessage, // Keep optimistic message fields like content
									...message, // Override with server data like id, timestamp
									isOptimistic: false,
									// Ensure content is preserved
									content: existingMessage.content || message.content,
									message_type: existingMessage.message_type || message.message_type || "text"
								};
								console.log("Merged optimistic message:", mergedMessage);
								updatedMessages[existingMessageIndex] = mergedMessage;
							} else {
								// Just replace non-optimistic message
								updatedMessages[existingMessageIndex] = { ...message, isOptimistic: false };
							}
						} else {
							// Add new message
							console.log("Adding new message:", message);
							updatedMessages = [...conversation.messages, { ...message, isOptimistic: false }];
						}

						return {
							conversations: {
								...state.conversations,
								[conversationId]: {
									...conversation,
									messages: updatedMessages,
									lastMessage: message,
									lastMessageTime: message.timestamp
								}
							}
						};
					});
				});

				chatWebSocketService.onTyping(data => {
					console.log("Typing status received:", data);
					const { conversationId, userId, isTyping } = data;

					// Update typing status in conversation
					set(state => ({
						conversations: {
							...state.conversations,
							[conversationId]: {
								...state.conversations[conversationId],
								typingUsers: {
									...state.conversations[conversationId]?.typingUsers,
									[userId]: isTyping
								}
							}
						}
					}));
				});

				chatWebSocketService.onConnection(data => {
					console.log("WebSocket connection status:", data);
				});
			} else {
				console.log("WebSocket service not initialized, chat will work without real-time updates");
			}

			// Load initial conversations
			const conversations = await chatApiService.getUserConversations();
			const conversationsMap = conversations.reduce((acc, conv) => {
				acc[conv.id] = {
					...conv,
					messages: conv.messages || [],
					lastMessage: conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
					lastMessageTime: conv.last_message_time
						? new Date(Number(conv.last_message_time) / 1000000).toISOString()
						: null,
					createdAt: new Date(Number(conv.created_at) / 1000000).toISOString(),
					unreadCount: conv.unread_counts[useStore.getState().user?.id] || 0,
					otherUserId: conv.participants.find(p => p !== useStore.getState().user?.id),
					typingUsers: {}
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
		const state = useStore.getState();
		const user = state.user;

		// Create optimistic message object
		const optimisticMessage = {
			id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
			content: message.content,
			message_type: "text",
			sender_id: user.id,
			timestamp: new Date().toISOString(),
			read: false,
			isOptimistic: true // Flag to identify optimistic messages
		};

		// Add message to local state immediately (optimistic update)
		set(state => {
			const conversation = state.conversations[conversationId];
			if (!conversation) return state;

			const updatedConversation = {
				...conversation,
				messages: [...conversation.messages, optimisticMessage],
				lastMessage: optimisticMessage,
				updatedAt: new Date().toISOString()
			};

			return {
				conversations: { ...state.conversations, [conversationId]: updatedConversation }
			};
		});

		try {
			// Send via backend API (this will also trigger WebSocket broadcast)
			const response = await chatApiService.sendMessage(conversationId, message.content);

			// If we get a response with message details, replace optimistic message
			if (response && response.id) {
				set(state => {
					const conversation = state.conversations[conversationId];
					if (!conversation) return state;

					const updatedMessages = conversation.messages.map(msg =>
						msg.id === optimisticMessage.id
							? {
									...optimisticMessage, // Preserve optimistic message fields
									...response, // Override with API response
									isOptimistic: false,
									// Ensure content is preserved
									content: optimisticMessage.content || response.content,
									message_type: optimisticMessage.message_type || response.message_type || "text"
							  }
							: msg
					);

					const updatedConversation = {
						...conversation,
						messages: updatedMessages,
						lastMessage: { ...optimisticMessage, ...response, isOptimistic: false }
					};

					return {
						conversations: { ...state.conversations, [conversationId]: updatedConversation }
					};
				});
			}
			// If no response or response doesn't have message details,
			// the WebSocket handler will replace the optimistic message
		} catch (error) {
			console.error("Failed to send message:", error);

			// Remove optimistic message on error and mark as failed
			set(state => {
				const conversation = state.conversations[conversationId];
				if (!conversation) return state;

				const updatedMessages = conversation.messages.map(msg =>
					msg.id === optimisticMessage.id ? { ...msg, failed: true, isOptimistic: false } : msg
				);

				const updatedConversation = {
					...conversation,
					messages: updatedMessages
				};

				return {
					conversations: { ...state.conversations, [conversationId]: updatedConversation }
				};
			});
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
			if (chatWebSocketService.isConnectedToWebSocket()) {
				await chatWebSocketService.sendTypingStatus(conversationId, isTyping);
			} else {
				// Fallback to API if WebSocket is not available
				await chatApiService.setTypingStatus(conversationId, isTyping);
			}
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
				// Initialize chat (services should already be initialized by the hook)
				await state.initializeChat();
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
	},

	// Refresh messages for a specific conversation
	refreshConversationMessages: async conversationId => {
		try {
			const messages = await chatApiService.getConversationMessages(conversationId);

			set(state => {
				const conversation = state.conversations[conversationId];
				if (!conversation) return state;

				const formattedMessages = messages.map(msg => ({
					id: msg.id,
					senderId: msg.sender_id,
					content: msg.content,
					type: msg.message_type,
					timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString(),
					read: msg.read
				}));

				const updatedConversation = {
					...conversation,
					messages: formattedMessages,
					lastMessage: formattedMessages[formattedMessages.length - 1] || null,
					lastMessageTime:
						formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].timestamp : null
				};

				return {
					conversations: {
						...state.conversations,
						[conversationId]: updatedConversation
					}
				};
			});
		} catch (error) {
			console.error("Failed to refresh conversation messages:", error);
		}
	}
}));

export default useStore;
