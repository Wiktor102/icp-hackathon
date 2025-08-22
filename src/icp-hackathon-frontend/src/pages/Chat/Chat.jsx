import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";

// hooks
import useStore from "../../store/store.js";
import useProtectRoute from "../../common/hooks/useProtectRoute.js";

// components
import Loader from "../../common/components/Loader/Loader.jsx";
import Empty from "../../common/components/Empty/Empty.jsx";
import ConversationList from "./ConversationList.jsx";
import ChatWindow from "./ChatWindow.jsx";

import "./Chat.scss";

function Chat() {
	const { conversationId } = useParams();
	const navigate = useNavigate();

	const user = useStore(state => state.user);
	const conversations = useStore(state => state.conversations);
	const activeConversationId = useStore(state => state.activeConversationId);
	const setActiveConversation = useStore(state => state.setActiveConversation);
	const chatInitialized = useStore(state => state.chatInitialized);
	const chatLoading = useStore(state => state.chatLoading);
	const chatError = useStore(state => state.chatError);
	const initializeChat = useStore(state => state.initializeChat);

	// Initialize chat services when component mounts
	useEffect(() => {
		if (!chatInitialized && !chatLoading && user) {
			// Use correct canister ID for local development
			const canisterId =
				process.env.DFX_NETWORK === "ic"
					? process.env.CANISTER_ID_ICP_HACKATHON_BACKEND || "mzik2-kaaaa-aaaao-qjw3q-cai"
					: "bkyz2-fmaaa-aaaaa-qaaaq-cai"; // Local canister ID
			initializeChat(canisterId);
		}
	}, [chatInitialized, chatLoading, user, initializeChat]);

	// Set active conversation from URL params
	useEffect(() => {
		if (conversationId && conversations[conversationId]) {
			setActiveConversation(conversationId);
		} else if (conversationId && !conversations[conversationId] && chatInitialized) {
			// Invalid conversation ID, redirect to chat home
			navigate("/chat");
		}
	}, [conversationId, conversations, setActiveConversation, navigate, chatInitialized]);

	const protection = useProtectRoute();
	if (protection === "error") return null;
	if (protection === "loading" || !user) {
		return <Loader />;
	}

	// Show loading state while initializing chat
	if (chatLoading || !chatInitialized) {
		return <Loader />;
	}

	// Show error state if chat initialization failed
	if (chatError) {
		return (
			<div className="chat-page">
				<div className="chat-error">
					<Empty icon={<i className="fas fa-exclamation-triangle"></i>}>
						Failed to initialize chat: {chatError}
					</Empty>
				</div>
			</div>
		);
	}

	const conversationList = Object.values(conversations).sort(
		(a, b) => new Date(b.lastMessageTime || b.createdAt) - new Date(a.lastMessageTime || a.createdAt)
	);

	return (
		<div className="chat-page">
			<div className="chat-layout">
				<div className="chat-sidebar">
					<div className="chat-header">
						<h2>Messages</h2>
					</div>
					{conversationList.length === 0 ? (
						<Empty>
							<i className="fas fa-comments"></i>
							No conversations yet. Start chatting by visiting a product listing!
						</Empty>
					) : (
						<ConversationList
							conversations={conversationList}
							activeConversationId={activeConversationId}
							onConversationSelect={id => navigate(`/chat/${id}`)}
						/>
					)}
				</div>

				<div className="chat-main">
					{activeConversationId && conversations[activeConversationId] ? (
						<ChatWindow conversation={conversations[activeConversationId]} />
					) : (
						<div className="chat-placeholder">
							<Empty icon={<i className="fas fa-comment-dots"></i>}>
								Select a conversation to start chatting
							</Empty>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Chat;
