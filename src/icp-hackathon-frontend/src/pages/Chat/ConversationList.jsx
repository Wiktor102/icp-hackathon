import avatarImg from "../../assets/avatar.png";
import useUserDetails from "../../common/hooks/useUserDetails.js";
import "./ConversationList.scss";

const formatTimestamp = timestamp => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

	if (diffInHours < 24) {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	} else if (diffInHours < 24 * 7) {
		return date.toLocaleDateString([], { weekday: "short" });
	} else {
		return date.toLocaleDateString([], { month: "short", day: "numeric" });
	}
};

const truncateMessage = (message, maxLength = 50) => {
	if (!message) return "";
	if (message.length <= maxLength) return message;
	return message.substring(0, maxLength) + "...";
};

function ConversationListItem({ conversation, isActive, onSelect }) {
	const { userDetails: otherUser } = useUserDetails(conversation.otherUserId);

	return (
		<div className={`conversation-item ${isActive ? "active" : ""}`} onClick={() => onSelect(conversation.id)}>
			<div className="conversation-avatar">
				<img src={otherUser?.avatar || avatarImg} alt={otherUser?.name || "User"} />
				{otherUser?.isOnline && <div className="online-indicator"></div>}
			</div>

			<div className="conversation-content">
				<div className="conversation-header">
					<span className="conversation-name">{otherUser?.name || "Unknown User"}</span>
					<span className="conversation-time">
						{formatTimestamp(conversation.lastMessageTime || conversation.createdAt)}
					</span>
				</div>

				<div className="conversation-preview">
					<span className={`last-message ${!conversation.lastMessage ? "no-message" : ""}`}>
						{conversation.lastMessage ? truncateMessage(conversation.lastMessage?.content) : "No messages yet"}
					</span>
					{conversation.unreadCount > 0 && (
						<span className="unread-badge">
							{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
						</span>
					)}
				</div>

				{/* TODO: check if  conversation.typing is really a boolean */}
				{conversation.typing && (
					<div className="typing-indicator">
						<span>{otherUser?.name} is typing...</span>
					</div>
				)}
			</div>
		</div>
	);
}

function ConversationList({ conversations, activeConversationId, onConversationSelect }) {
	return (
		<div className="conversation-list">
			{conversations.map(conversation => (
				<ConversationListItem
					key={conversation.id}
					conversation={conversation}
					isActive={activeConversationId === conversation.id}
					onSelect={onConversationSelect}
				/>
			))}
		</div>
	);
}

export default ConversationList;
