import { useState } from "react";
import { useNavigate } from "react-router";
import useStore from "../../store/store.js";
import Button from "../Button.jsx";

function StartChatButton({ listingId, listingTitle, ownerId, className = "" }) {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const user = useStore(state => state.user);
	const createConversation = useStore(state => state.createConversation);

	const handleStartChat = async () => {
		if (!user) {
			// Redirect to login or show login modal
			alert("Please sign in to start a conversation");
			return;
		}

		if (user.id === ownerId) {
			alert("You cannot start a conversation with yourself");
			return;
		}

		setIsLoading(true);
		try {
			const conversationId = await createConversation(listingId, ownerId, listingTitle);
			navigate(`/chat/${conversationId}`);
		} catch (error) {
			console.error("Failed to start conversation:", error);
			alert("Failed to start conversation. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleStartChat}
			disabled={isLoading || !user || user.id === ownerId}
			className={`start-chat-button ${className}`}
		>
			{isLoading ? (
				<>
					<i className="fas fa-spinner fa-spin"></i>
					Starting...
				</>
			) : (
				<>
					<i className="fas fa-comment"></i>
					Contact Seller
				</>
			)}
		</Button>
	);
}

export default StartChatButton;
