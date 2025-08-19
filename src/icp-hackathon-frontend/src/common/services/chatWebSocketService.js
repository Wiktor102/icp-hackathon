import { IcWebSocket, generateRandomIdentity } from "ic-websocket-js";
import { Actor } from "@dfinity/agent";
import { idlFactory } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";

class ChatWebSocketService {
	constructor() {
		this.ws = null;
		this.isConnected = false;
		this.messageHandlers = new Set();
		this.typingHandlers = new Set();
		this.connectionHandlers = new Set();
		this.canisterId = null;
		this.identity = null;
		this.canisterActor = null;
	}

	async initialize(canisterId, identity = null, agent = null) {
		if (!identity) {
			throw new Error("Identity is required for WebSocket initialization");
		}

		if (!agent) {
			throw new Error("Agent is required for WebSocket initialization");
		}

		try {
			this.canisterId = canisterId;
			this.identity = identity;

			// Create canister actor for WebSocket
			this.canisterActor = Actor.createActor(idlFactory, {
				agent: agent,
				canisterId: canisterId
			});

			// Configure WebSocket gateway URL
			const gatewayUrl =
				process.env.DFX_NETWORK === "ic"
					? "wss://gateway.icws.io" // Production gateway
					: "ws://127.0.0.1:8080"; // Local gateway

			console.log("Initializing IC WebSocket with gateway:", gatewayUrl);

			// Create WebSocket connection
			this.ws = new IcWebSocket(gatewayUrl, undefined, {
				canisterId: this.canisterId,
				canisterActor: this.canisterActor,
				identity: this.identity,
				networkUrl: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943"
			});

			// Set up event handlers
			this.ws.onopen = () => {
				console.log("WebSocket connection opened");
				this.isConnected = true;
				this.notifyConnectionHandlers({ type: "connected" });
			};

			this.ws.onclose = () => {
				console.log("WebSocket connection closed");
				this.isConnected = false;
				this.notifyConnectionHandlers({ type: "disconnected" });
			};

			this.ws.onerror = error => {
				console.error("WebSocket error:", error);
				this.notifyConnectionHandlers({ type: "error", error });
			};

			this.ws.onmessage = event => {
				this.handleIncomingMessage(event.data);
			};

			return true;
		} catch (error) {
			console.error("Failed to initialize WebSocket:", error);
			throw error; // Don't fallback to mock mode, fail properly
		}
	}

	handleIncomingMessage(rawData) {
		try {
			const message = JSON.parse(rawData);

			switch (message.message_type) {
				case "new_message":
					const messageData = JSON.parse(message.data);
					this.notifyMessageHandlers({
						type: "new_message",
						conversationId: message.conversation_id,
						message: messageData
					});
					break;

				case "typing_status":
					const typingData = JSON.parse(message.data);
					this.notifyTypingHandlers({
						type: "typing_status",
						conversationId: typingData.conversation_id,
						userId: typingData.user_id,
						isTyping: typingData.is_typing
					});
					break;

				default:
					console.warn("Unknown message type:", message.message_type);
			}
		} catch (error) {
			console.error("Error parsing incoming message:", error);
		}
	}

	async sendMessage(conversationId, content) {
		if (!this.isConnected || !this.ws) {
			console.warn("WebSocket not connected - message will be sent via API only");
			return;
		}

		try {
			const message = {
				message_type: "new_message",
				conversation_id: conversationId,
				data: JSON.stringify({
					content: content,
					timestamp: Date.now()
				})
			};

			this.ws.send(JSON.stringify(message));
			console.log("Message sent via WebSocket");
		} catch (error) {
			console.error("Failed to send message via WebSocket:", error);
		}
	}

	async sendTypingStatus(conversationId, isTyping) {
		if (!this.isConnected || !this.ws) {
			return;
		}

		try {
			const message = {
				message_type: "typing_status",
				conversation_id: conversationId,
				data: JSON.stringify({
					is_typing: isTyping,
					timestamp: Date.now()
				})
			};

			this.ws.send(JSON.stringify(message));
		} catch (error) {
			console.error("Failed to send typing status via WebSocket:", error);
		}
	}

	async markAsRead(conversationId) {
		if (!this.isConnected || !this.ws) {
			return;
		}

		try {
			const message = {
				message_type: "mark_read",
				conversation_id: conversationId,
				data: JSON.stringify({
					timestamp: Date.now()
				})
			};

			this.ws.send(JSON.stringify(message));
		} catch (error) {
			console.error("Failed to send mark as read via WebSocket:", error);
		}
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.isConnected = false;
		console.log("WebSocket disconnected");
	}

	// Event handler management
	onMessage(handler) {
		this.messageHandlers.add(handler);
		return () => this.messageHandlers.delete(handler);
	}

	onTyping(handler) {
		this.typingHandlers.add(handler);
		return () => this.typingHandlers.delete(handler);
	}

	onConnection(handler) {
		this.connectionHandlers.add(handler);
		return () => this.connectionHandlers.delete(handler);
	}

	notifyMessageHandlers(data) {
		this.messageHandlers.forEach(handler => {
			try {
				handler(data);
			} catch (error) {
				console.error("Error in message handler:", error);
			}
		});
	}

	notifyTypingHandlers(data) {
		this.typingHandlers.forEach(handler => {
			try {
				handler(data);
			} catch (error) {
				console.error("Error in typing handler:", error);
			}
		});
	}

	notifyConnectionHandlers(data) {
		this.connectionHandlers.forEach(handler => {
			try {
				handler(data);
			} catch (error) {
				console.error("Error in connection handler:", error);
			}
		});
	}

	disconnect() {
		this.isConnected = false;
		console.log("Mock WebSocket disconnected");
	}

	getConnectionStatus() {
		return {
			isConnected: this.isConnected,
			canisterId: this.canisterId,
			mockMode: this.mockMode
		};
	}
}

// Export singleton instance
export const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;
