import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";

class ChatApiService {
	constructor() {
		this.agent = null;
		this.actor = null;
		this.canisterId = null;
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

			return true;
		} catch (error) {
			console.error("Failed to initialize chat API:", error);
			throw error;
		}
	}

	getAgent() {
		return this.agent;
	}

	async createConversation(listingId, otherUserId) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			const result = await this.actor.create_conversation(listingId, otherUserId);
			if ("Ok" in result) {
				return result.Ok;
			} else {
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to create conversation:", error);
			throw error;
		}
	}

	async sendMessage(conversationId, content) {
		if (!this.actor) {
			throw new Error("Chat API not initialized");
		}

		try {
			const result = await this.actor.send_chat_message(conversationId, content);
			if ("Ok" in result) {
				return result.Ok;
			} else {
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
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
