import { useEffect, useCallback } from "react";
import { useCanister } from "./useCanister";
import { useInternetIdentity } from "ic-use-internet-identity";
import { chatApiService } from "../services/chatApiService";
import { chatWebSocketService } from "../services/chatWebSocketService";
import { canisterId } from "../../../../declarations/icp-hackathon-backend/index.js";

/**
 * Custom hook to manage chat functionality with proper authentication
 */
export function useChat() {
	const { identity } = useInternetIdentity();
	const { actor } = useCanister();

	// Initialize chat services when actor and identity are available
	useEffect(() => {
		if (actor && identity && canisterId) {
			try {
				// Initialize chat API service with the authenticated actor
				chatApiService.initializeWithActor(actor, canisterId);

				// Initialize WebSocket service with the authenticated actor and identity
				chatWebSocketService.initializeWithActor(actor, canisterId, identity);

				console.log("Chat services initialized successfully");
			} catch (error) {
				console.error("Failed to initialize chat services:", error);
			}
		}
	}, [actor, identity]);

	// Check if chat is ready to use
	const isChatReady = useCallback(() => {
		return chatApiService.isInitialized() && identity !== null;
	}, [identity]);

	return {
		isChatReady: isChatReady(),
		chatApiService,
		chatWebSocketService,
		identity,
		actor
	};
}

export default useChat;
