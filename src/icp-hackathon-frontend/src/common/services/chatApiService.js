import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";

class ChatApiService {
	constructor() {
		this.agent = null;
		this.actor = null;
		this.canisterId = null;
		this.ws = null;
		this.messageHandlers = new Set();
	}

	async initialize(canisterId, identity = null) {
		try {
			this.canisterId = canisterId;

			// Create agent with proper host
			const host = process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943";
			this.agent = new HttpAgent({ host });

			// For local development, fetch root key
			if (process.env.DFX_NETWORK !== "ic") {
				await this.agent.fetchRootKey();
			}

			// Use provided identity if available
			if (identity) {
				this.agent.replaceIdentity(identity);
			}

			// Create actor
			this.actor = Actor.createActor(idlFactory, {
				agent: this.agent,
				canisterId
			});

			// Initialize WebSocket connection
			await this.initializeWebSocket();

			return true;
		} catch (error) {
			console.error("Failed to initialize chat API:", error);
			throw error;
		}
	}

	async initializeWebSocket() {
		console.log("Chat API initialized successfully (WebSocket disabled for simplicity)");
		return true;
	}

	onMessage(handler) {
		this.messageHandlers.add(handler);
		return () => this.messageHandlers.delete(handler);
	}

	getAgent() {
		return this.agent;
	}

	async createConversation(listingId) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		console.log("ChatAPI: Creating conversation for listing id:", listingId);

		try {
			const result = await this.actor.create_conversation(listingId);
			console.log("ChatAPI: Backend result:", result);

			if ("Ok" in result) {
				// Return the full conversation object from the backend
				console.log("ChatAPI: Conversation created successfully:", result.Ok);
				return result.Ok;
			} else {
				console.error("ChatAPI: Backend error:", result.Err);
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("ChatAPI: Failed to create conversation:", error);
			throw error;
		}
	}

	async isUserParticipant(conversationId) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}
		try {
			const conversations = await this.getUserConversations();
			return conversations.some(conv => conv.id === conversationId);
		} catch (error) {
			console.error("Failed to check user participation:", { error, conversationId });
			return false;
		}
	}

	async sendMessage(conversationId, content) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		// Improved validation for conversationId
		if (
			!conversationId ||
			typeof conversationId !== "string" ||
			conversationId.trim() === "" ||
			conversationId.startsWith("undefined") ||
			conversationId.includes("undefined")
		) {
			console.warn("Attempted to send message to invalid conversationId:", conversationId);
			throw new Error(`Invalid conversation ID: ${conversationId}`);
		}

		const isParticipant = await this.isUserParticipant(conversationId);
		if (!isParticipant) {
			console.error("User is not a participant in this conversation.", { conversationId, content });
			throw new Error("User is not a participant in this conversation.");
		}

		try {
			const result = await this.actor.send_chat_message(conversationId, content);
			if ("Ok" in result) {
				// Message broadcasting is now handled automatically by the backend
				return result.Ok;
			} else {
				console.error("Failed to send message:", {
					error: result.Err,
					conversationId,
					content
				});
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to send message:", {
				error,
				conversationId,
				content
			});
			throw error;
		}
	}

	async getConversationMessages(conversationId) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			const result = await this.actor.get_conversation_messages(conversationId);
			if ("Ok" in result) {
				return result.Ok;
			} else {
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to get conversation messages:", error);
			throw error;
		}
	}

	async getUserConversations() {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			return await this.actor.get_user_conversations();
		} catch (error) {
			console.error("Failed to get user conversations:", error);
			throw error;
		}
	}

	async markConversationAsRead(conversationId) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			const result = await this.actor.mark_conversation_read(conversationId);
			if ("Ok" in result) {
				return true;
			} else {
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to mark conversation as read:", error);
			throw error;
		}
	}

	async setTypingStatus(conversationId, isTyping) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			const result = await this.actor.set_typing_status(conversationId, isTyping);
			if ("Ok" in result) {
				return true;
			} else {
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to set typing status:", error);
			throw error;
		}
	}
}

// Export singleton instance
export const chatApiService = new ChatApiService();
export default chatApiService;
