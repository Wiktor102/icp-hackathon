import { useEffect, useRef, useState } from "react";
import useStore from "../../store/store.js";
import ChatInput from "./ChatInput.jsx";
import avatarImg from "../../assets/avatar.png";
import "./ChatWindow.scss";
import useUserDetails from "../../common/hooks/useUserDetails.js";

// Component for rendering message content based on message type
function MessageBubble({ message }) {
	// Debug logging to see what's in the message
	if (!message.content && !message.fileName) {
		console.warn("MessageBubble received empty message:", message);
	}

	// Default to text if message_type is not specified
	const messageType = message.message_type || "text";

	return (
		<div className="message-bubble">
			{(messageType === "text" || !messageType) && <p>{message.content}</p>}
			{messageType === "image" && (
				<div className="message-image">
					<img src={message.content} alt="Shared image" />
				</div>
			)}
			{messageType === "file" && (
				<div className="message-file">
					<i className="fas fa-file"></i>
					<span>{message.fileName || "File"}</span>
				</div>
			)}
		</div>
	);
}

// Component for rendering individual message with optional date separator
function MessageItem({
	message,
	previousMessage,
	user,
	conversation,
	showTimestamps,
	formatMessageDate,
	formatMessageTime
}) {
	// Handle both backend message format (sender_id) and frontend format (senderId)
	const senderId = message.sender_id || message.senderId;
	const isOwn = senderId === user?.id;
	const isOptimistic = message.isOptimistic;
	const isFailed = message.failed;

	const shouldShowDateSeparator = (currentMessage, previousMessage) => {
		if (!previousMessage) return true;

		// Handle both timestamp formats (nanoseconds from backend, ISO string from frontend)
		const getCurrentTimestamp = msg => {
			if (typeof msg.timestamp === "string") {
				return new Date(msg.timestamp);
			} else {
				return new Date(Number(msg.timestamp) / 1000000);
			}
		};

		const currentDate = getCurrentTimestamp(currentMessage).toDateString();
		const previousDate = getCurrentTimestamp(previousMessage).toDateString();

		return currentDate !== previousDate;
	};
	const showDate = shouldShowDateSeparator(message, previousMessage);

	return (
		<div key={message.id}>
			{showDate && (
				<div className="date-separator">
					<span>{formatMessageDate(message.timestamp)}</span>
				</div>
			)}

			<div
				className={`message ${isOwn ? "own" : "other"} ${isOptimistic ? "optimistic" : ""} ${
					isFailed ? "failed" : ""
				}`}
			>
				{!isOwn && (
					<img
						src={conversation.otherUser?.avatar || avatarImg}
						alt={conversation.otherUser?.name}
						className="message-avatar"
					/>
				)}

				<div className="message-content">
					<MessageBubble message={message} />

					{showTimestamps && (
						<div className="message-time">
							{formatMessageTime(message.timestamp)}
							{isOwn && !isOptimistic && !isFailed && message.read && (
								<i className="fas fa-check-double read-receipt"></i>
							)}
							{isOwn && !isOptimistic && !isFailed && !message.read && (
								<i className="fas fa-check sent-receipt"></i>
							)}
							{isOwn && isOptimistic && <i className="fas fa-clock pending-receipt" title="Sending..."></i>}
							{isOwn && isFailed && (
								<i className="fas fa-exclamation-triangle failed-receipt" title="Failed to send"></i>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Component for rendering typing indicator
function TypingIndicator({ conversation }) {
	return (
		<div className="typing-indicator-message">
			<img
				src={conversation.otherUser?.avatar || avatarImg}
				alt={conversation.otherUser?.name}
				className="message-avatar"
			/>
			<div className="typing-dots">
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	);
}

function ChatWindow({ conversation }) {
	const user = useStore(state => state.user);
	const markConversationAsRead = useStore(state => state.markConversationAsRead);
	const refreshConversationMessages = useStore(state => state.refreshConversationMessages);
	const messagesEndRef = useRef(null);
	const [showTimestamps, setShowTimestamps] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { userDetails: otherUser, isLoading: otherUserLoading } = useUserDetails(conversation.otherUserId);
	console.log(conversation);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [conversation.messages]);

	// Mark conversation as read when opened
	useEffect(() => {
		if (conversation.unreadCount > 0) {
			markConversationAsRead(conversation.id);
		}
	}, [conversation.id, conversation.unreadCount, markConversationAsRead]);

	// Periodic refresh of messages every 5 seconds
	useEffect(() => {
		const refreshInterval = setInterval(async () => {
			try {
				await refreshConversationMessages(conversation.id);
			} catch (error) {
				console.error("Failed to auto-refresh messages:", error);
			}
		}, 5000); // 5 seconds

		// Cleanup interval on component unmount or conversation change
		return () => clearInterval(refreshInterval);
	}, [conversation.id, refreshConversationMessages]);

	const handleRefreshMessages = async () => {
		setIsRefreshing(true);
		try {
			await refreshConversationMessages(conversation.id);
		} catch (error) {
			console.error("Failed to refresh messages:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const formatMessageTime = timestamp => {
		// Handle both timestamp formats (nanoseconds from backend, ISO string from frontend)
		let date;
		if (typeof timestamp === "string") {
			date = new Date(timestamp);
		} else {
			date = new Date(Number(timestamp) / 1000000);
		}
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const formatMessageDate = timestamp => {
		// Handle both timestamp formats (nanoseconds from backend, ISO string from frontend)
		let date;
		if (typeof timestamp === "string") {
			date = new Date(timestamp);
		} else {
			date = new Date(Number(timestamp) / 1000000);
		}

		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return "Today";
		} else if (date.toDateString() === yesterday.toDateString()) {
			return "Yesterday";
		} else {
			return date.toLocaleDateString([], {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric"
			});
		}
	};

	const typingUsers = Object.keys(conversation.typingUsers || {}).filter(userId => userId !== user?.id);

	return (
		<div className="chat-window">
			<div className="chat-window-header">
				<div className="chat-participant">
					<img src={otherUser?.avatar || avatarImg} alt={otherUser?.name} />
					<div className="participant-info">
						<h3>{otherUser?.name || "Unknown User"}</h3>
						<span className="participant-status">{otherUser?.isOnline ? "Online" : "Last seen recently"}</span>
					</div>
				</div>

				<div className="chat-actions">
					<button
						className="refresh-button"
						onClick={handleRefreshMessages}
						disabled={isRefreshing}
						title="Refresh messages"
					>
						<i className={`fas fa-sync-alt ${isRefreshing ? "fa-spin" : ""}`}></i>
					</button>
					<button
						className="timestamp-toggle"
						onClick={() => setShowTimestamps(!showTimestamps)}
						title={showTimestamps ? "Hide timestamps" : "Show timestamps"}
					>
						<i className="fas fa-clock"></i>
					</button>
				</div>
			</div>

			<div className="chat-messages">
				{conversation.messages?.map((message, index) => {
					const previousMessage = index > 0 ? conversation.messages[index - 1] : null;

					return (
						<MessageItem
							key={message.id}
							message={message}
							previousMessage={previousMessage}
							user={user}
							conversation={conversation}
							showTimestamps={showTimestamps}
							formatMessageDate={formatMessageDate}
							formatMessageTime={formatMessageTime}
						/>
					);
				})}

				{typingUsers.length > 0 && <TypingIndicator conversation={conversation} />}

				<div ref={messagesEndRef} />
			</div>

			<ChatInput conversationId={conversation.id} />
		</div>
	);
}

export default ChatWindow;
