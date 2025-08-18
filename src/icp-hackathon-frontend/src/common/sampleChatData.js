// This file adds sample chat data for testing purposes
// It should be removed when real backend integration is implemented

import useStore from "../store/store.js";

export const initializeSampleData = () => {
	const addConversation = useStore.getState().addConversation;
	const addMessage = useStore.getState().addMessage;
	
	// Sample conversation 1
	const conversation1 = {
		id: "sample-conv-1",
		participants: ["user1", "user2"],
		otherUser: {
			id: "user2",
			name: "Anna Kowalska",
			avatar: null,
			isOnline: true
		},
		messages: [],
		createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
		lastMessage: null,
		lastMessageTime: null,
		unreadCount: 2,
		typingUsers: {},
		listingId: 1,
		listingTitle: "Organic Apples"
	};

	// Sample conversation 2
	const conversation2 = {
		id: "sample-conv-2",
		participants: ["user1", "user3"],
		otherUser: {
			id: "user3",
			name: "Piotr Nowak",
			avatar: null,
			isOnline: false
		},
		messages: [],
		createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
		lastMessage: null,
		lastMessageTime: null,
		unreadCount: 0,
		typingUsers: {},
		listingId: 2,
		listingTitle: "Fresh Vegetables Bundle"
	};

	// Add conversations
	addConversation(conversation1);
	addConversation(conversation2);

	// Add sample messages to conversation 1
	const messages1 = [
		{
			id: "msg-1",
			senderId: "user2",
			content: "Hi! I'm interested in your organic apples. Are they still available?",
			type: 'text',
			timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-2",
			senderId: "user1",
			content: "Hello! Yes, they are still available. How many kilograms would you like?",
			type: 'text',
			timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-3",
			senderId: "user2",
			content: "I'd like to order 10kg. What's the price per kilogram?",
			type: 'text',
			timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-4",
			senderId: "user1",
			content: "The price is 8 PLN per kilogram. For 10kg that would be 80 PLN total.",
			type: 'text',
			timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-5",
			senderId: "user2",
			content: "Perfect! Can I pick them up tomorrow?",
			type: 'text',
			timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
			read: false
		},
		{
			id: "msg-6",
			senderId: "user2",
			content: "And do you have any certificates for organic farming?",
			type: 'text',
			timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
			read: false
		}
	];

	// Add sample messages to conversation 2
	const messages2 = [
		{
			id: "msg-7",
			senderId: "user3",
			content: "Hello, I saw your vegetable bundle. What exactly is included?",
			type: 'text',
			timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-8",
			senderId: "user1",
			content: "Hi! The bundle includes carrots, potatoes, onions, and tomatoes. All freshly harvested.",
			type: 'text',
			timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
			read: true
		},
		{
			id: "msg-9",
			senderId: "user3",
			content: "Sounds great! I'll think about it and get back to you.",
			type: 'text',
			timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
			read: true
		}
	];

	// Add messages to conversations
	messages1.forEach(message => addMessage(conversation1.id, message));
	messages2.forEach(message => addMessage(conversation2.id, message));
};

export default initializeSampleData;