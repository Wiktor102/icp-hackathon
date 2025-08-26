import React, { useEffect } from "react";
import { useChat } from "../hooks/useChat";
import useStore from "../../store/store";

/**
 * ChatProvider component that handles chat initialization with proper authentication
 * This should be used high up in the component tree, after authentication is established
 */
export function ChatProvider({ children }) {
	const { isChatReady } = useChat();
	const { initializeChat, chatInitialized } = useStore();

	useEffect(() => {
		// Initialize chat when the services are ready and chat hasn't been initialized yet
		if (isChatReady && !chatInitialized) {
			console.log("Initializing chat services...");
			initializeChat().catch(error => {
				console.error("Failed to initialize chat:", error);
			});
		}
	}, [isChatReady, chatInitialized, initializeChat]);

	return <>{children}</>;
}

export default ChatProvider;
