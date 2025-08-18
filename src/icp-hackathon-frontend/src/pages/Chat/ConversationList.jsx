import avatarImg from "../../assets/avatar.png";
import "./ConversationList.scss";

function ConversationList({ conversations, activeConversationId, onConversationSelect }) {
	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
		
		if (diffInHours < 24) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else if (diffInHours < 24 * 7) {
			return date.toLocaleDateString([], { weekday: 'short' });
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
		}
	};

	const truncateMessage = (message, maxLength = 50) => {
		if (!message) return "";
		if (message.length <= maxLength) return message;
		return message.substring(0, maxLength) + "...";
	};

	return (
		<div className="conversation-list">
			{conversations.map((conversation) => (
				<div
					key={conversation.id}
					className={`conversation-item ${
						activeConversationId === conversation.id ? "active" : ""
					}`}
					onClick={() => onConversationSelect(conversation.id)}
				>
					<div className="conversation-avatar">
						<img 
							src={conversation.otherUser?.avatar || avatarImg} 
							alt={conversation.otherUser?.name || "User"}
						/>
						{conversation.otherUser?.isOnline && (
							<div className="online-indicator"></div>
						)}
					</div>
					
					<div className="conversation-content">
						<div className="conversation-header">
							<span className="conversation-name">
								{conversation.otherUser?.name || "Unknown User"}
							</span>
							<span className="conversation-time">
								{formatTimestamp(conversation.lastMessageTime || conversation.createdAt)}
							</span>
						</div>
						
						<div className="conversation-preview">
							<span className={`last-message ${!conversation.lastMessage ? "no-message" : ""}`}>
								{conversation.lastMessage 
									? truncateMessage(conversation.lastMessage.content)
									: "No messages yet"
								}
							</span>
							{conversation.unreadCount > 0 && (
								<span className="unread-badge">
									{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
								</span>
							)}
						</div>
						
						{conversation.typing && (
							<div className="typing-indicator">
								<span>{conversation.otherUser?.name} is typing...</span>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default ConversationList;