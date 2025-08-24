import { IcWebSocket } from "ic-websocket-js";
import { Actor, HttpAgent } from "@dfinity/agent";
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
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
		this.reconnectDelay = 1000; // Start with 1 second
	}

	async initialize(canisterId, identity) {
		if (!identity) {
			throw new Error("Identity is required for WebSocket initialization");
		}

		try {
			this.canisterId = canisterId;
			this.identity = identity;

			// Create HTTP agent
			const agent = new HttpAgent({
				host: process.env.DFX_NETWORK === "ic" ? "https://icp-api.io" : "http://localhost:4943",
				identity: this.identity
			});

			// Fetch root key for local development
			if (process.env.DFX_NETWORK !== "ic") {
				await agent.fetchRootKey();
			}

			// Create canister actor for WebSocket
			this.canisterActor = Actor.createActor(idlFactory, {
				agent: agent,
				canisterId: canisterId
			});

			// Configure WebSocket gateway URL
			const gatewayUrl =
				process.env.DFX_NETWORK === "ic"
					? "wss://gateway.icws.io" // Production gateway
					: "ws://127.0.0.1:7777"; // Local gateway on port 7777

			console.log("Initializing IC WebSocket with gateway:", gatewayUrl);

			// Create WebSocket connection
			this.ws = new IcWebSocket(gatewayUrl, undefined, {
				canisterId: this.canisterId,
				canisterActor: this.canisterActor,
				identity: this.identity,
				networkUrl: process.env.DFX_NETWORK === "ic" ? "https://icp-api.io" : "http://localhost:4943"
			});

			// Set up event handlers
			this.ws.onopen = () => {
				console.log("WebSocket connection opened");
				this.isConnected = true;
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;
				this.notifyConnectionHandlers({ type: "connected" });
			};

			this.ws.onclose = event => {
				console.log("WebSocket connection closed", event);
				this.isConnected = false;
				this.notifyConnectionHandlers({ type: "disconnected" });

				// Attempt to reconnect if it wasn't intentional
				if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
					this.scheduleReconnect();
				}
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
			throw error;
		}
	}

	scheduleReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnection attempts reached");
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

		console.log(
			`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
		);

		setTimeout(async () => {
			try {
				await this.initialize(this.canisterId, this.identity);
			} catch (error) {
				console.error("Reconnection failed:", error);
				this.scheduleReconnect();
			}
		}, delay);
	}

	handleIncomingMessage(rawData) {
		try {
			console.log("Raw WebSocket message received:", rawData);

			// The message should be a Candid-encoded message
			// For now, let's try to parse it as different message types
			if (typeof rawData === "string") {
				const message = JSON.parse(rawData);
				this.processMessage(message);
			} else {
				// It's likely a Candid-encoded message, we'd need to decode it
				console.log("Received binary message, attempting to decode...");
				// For now, just log it
			}
		} catch (error) {
			console.error("Failed to parse incoming message:", error, rawData);
		}
	}

	processMessage(message) {
		console.log("Processing message:", message);

		switch (message.message_type) {
			case "new_message":
				this.notifyMessageHandlers({
					type: "new_message",
					conversationId: message.conversation_id,
					message: {
						id: Date.now() + Math.random(), // Generate a temporary ID
						sender_id: message.sender_id,
						content: message.content,
						timestamp: message.timestamp,
						message_type: "text",
						read: false
					}
				});
				break;

			case "typing_status":
				this.notifyTypingHandlers({
					type: "typing_status",
					conversationId: message.conversation_id,
					userId: message.user_id,
					isTyping: message.is_typing
				});
				break;

			case "connection_established":
				console.log("Connection established with backend");
				break;

			default:
				console.log("Unknown message type:", message.message_type);
		}
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

	// Send message via WebSocket
	sendMessage(conversationId, content) {
		if (!this.isConnected || !this.ws) {
			throw new Error("WebSocket not connected");
		}

		const message = {
			message_type: "chat_message",
			data: JSON.stringify({
				message_type: "chat_message",
				conversation_id: conversationId,
				sender_id: this.identity.getPrincipal().toString(),
				content: content,
				timestamp: Date.now() * 1000000 // Convert to nanoseconds
			})
		};

		try {
			this.ws.send(message);
		} catch (error) {
			console.error("Failed to send message via WebSocket:", error);
			throw error;
		}
	}

	// Send typing status via WebSocket
	sendTypingStatus(conversationId, isTyping) {
		if (!this.isConnected || !this.ws) {
			console.warn("WebSocket not connected, skipping typing status");
			return;
		}

		const message = {
			message_type: "typing_status",
			data: JSON.stringify({
				conversation_id: conversationId,
				user_id: this.identity.getPrincipal().toString(),
				is_typing: isTyping
			})
		};

		try {
			this.ws.send(message);
		} catch (error) {
			console.error("Failed to send typing status via WebSocket:", error);
		}
	}

	// Close connection
	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.isConnected = false;
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
	}

	// Check connection status
	isConnectedToWebSocket() {
		return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
	}
}

// Export singleton instance
export const chatWebSocketService = new ChatWebSocketService();
