import { useState, useRef, useEffect } from "react";
import useStore from "../../store/store.js";
import Button from "../../common/Button.jsx";
import "./ChatInput.scss";

function ChatInput({ conversationId }) {
	const [message, setMessage] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const fileInputRef = useRef(null);
	const imageInputRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	const user = useStore(state => state.user);
	const addMessage = useStore(state => state.addMessage);
	const sendTypingStatus = useStore(state => state.sendTypingStatus);

	// Handle typing status
	const handleTyping = value => {
		setMessage(value);

		if (!isTyping && value.trim()) {
			setIsTyping(true);
			sendTypingStatus(conversationId, true);
		}

		// Clear previous timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Set new timeout to stop typing status
		typingTimeoutRef.current = setTimeout(() => {
			if (isTyping) {
				setIsTyping(false);
				sendTypingStatus(conversationId, false);
			}
		}, 2000);
	};

	// Clean up typing status on component unmount
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			if (isTyping) {
				sendTypingStatus(conversationId, false);
			}
		};
	}, [conversationId, isTyping, sendTypingStatus]);

	const sendMessage = async () => {
		if (message.trim() === "" && attachments.length === 0) return;

		// Clear typing status immediately when sending
		if (isTyping) {
			setIsTyping(false);
			sendTypingStatus(conversationId, false);
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		}

		try {
			// Send text message if there's content
			if (message.trim() !== "") {
				const newMessage = {
					id: Date.now() + Math.random(),
					senderId: user.id,
					content: message.trim(),
					type: "text",
					timestamp: new Date().toISOString(),
					read: false
				};

				await addMessage(conversationId, newMessage);
			}

			// TODO: Handle attachment messages when file upload is implemented
			// attachments.forEach((attachment, index) => {
			// 	const attachmentMessage = {
			// 		id: Date.now() + Math.random() + index,
			// 		senderId: user.id,
			// 		content: attachment.url,
			// 		type: attachment.type,
			// 		fileName: attachment.name,
			// 		timestamp: new Date().toISOString(),
			// 		read: false
			// 	};
			//
			// 	addMessage(conversationId, attachmentMessage);
			// });

			// Clear input
			setMessage("");
			setAttachments([]);
			setShowAttachmentMenu(false);
		} catch (error) {
			console.error("Failed to send message:", error);
			// TODO: Show error message to user
		}
	};

	const handleKeyPress = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleFileSelect = (e, type) => {
		const files = Array.from(e.target.files);

		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = event => {
				const newAttachment = {
					id: Date.now() + Math.random(),
					name: file.name,
					type: type,
					size: file.size,
					url: event.target.result
				};

				setAttachments(prev => [...prev, newAttachment]);
			};

			if (type === "image") {
				reader.readAsDataURL(file);
			} else {
				reader.readAsDataURL(file); // For demo purposes, we'll use data URLs for all files
			}
		});

		// Reset input
		e.target.value = "";
		setShowAttachmentMenu(false);
	};

	const removeAttachment = attachmentId => {
		setAttachments(prev => prev.filter(att => att.id !== attachmentId));
	};

	const formatFileSize = bytes => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<div className="chat-input">
			{/* Attachment previews */}
			{attachments.length > 0 && (
				<div className="attachment-previews">
					{attachments.map(attachment => (
						<div key={attachment.id} className="attachment-preview">
							{attachment.type === "image" ? (
								<img src={attachment.url} alt={attachment.name} />
							) : (
								<div className="file-preview">
									<i className="fas fa-file"></i>
									<span className="file-name">{attachment.name}</span>
									<span className="file-size">{formatFileSize(attachment.size)}</span>
								</div>
							)}
							<button className="remove-attachment" onClick={() => removeAttachment(attachment.id)}>
								<i className="fas fa-times"></i>
							</button>
						</div>
					))}
				</div>
			)}

			{/* Input area */}
			<div className="input-area">
				<div className="input-controls">
					{/* Attachment menu */}
					<div className="attachment-menu">
						<button className="attachment-button" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}>
							<i className="fas fa-paperclip"></i>
						</button>

						{showAttachmentMenu && (
							<div className="attachment-dropdown">
								<button onClick={() => imageInputRef.current?.click()} className="attachment-option">
									<i className="fas fa-image"></i>
									<span>Photo</span>
								</button>
								<button onClick={() => fileInputRef.current?.click()} className="attachment-option">
									<i className="fas fa-file"></i>
									<span>File</span>
								</button>
							</div>
						)}
					</div>

					{/* Emoji button placeholder */}
					<button className="emoji-button" title="Add emoji (coming soon)">
						<i className="fas fa-smile"></i>
					</button>
				</div>

				{/* Text input */}
				<textarea
					value={message}
					onChange={e => handleTyping(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Type a message..."
					className="message-input"
					rows={1}
				/>

				{/* Send button */}
				<Button
					onClick={sendMessage}
					disabled={message.trim() === "" && attachments.length === 0}
					className="send-button"
				>
					<i className="fas fa-paper-plane"></i>
				</Button>

				{/* Hidden file inputs */}
				<input
					ref={imageInputRef}
					type="file"
					accept="image/*"
					multiple
					style={{ display: "none" }}
					onChange={e => handleFileSelect(e, "image")}
				/>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					style={{ display: "none" }}
					onChange={e => handleFileSelect(e, "file")}
				/>
			</div>
		</div>
	);
}

export default ChatInput;
