# ICP Chat Integration Guide

## Overview

This project now includes a fully integrated chat system using the Internet Computer WebSocket Gateway for real-time messaging. The chat system allows users to communicate about product listings in real-time.

## Architecture

### Backend Components

1. **Chat Module** (`src/icp-hackathon-backend/src/chat.rs`)
   - Defines data structures for messages, conversations, and WebSocket messages
   - Manages conversation storage and user relationships

2. **Backend API** (`src/icp-hackathon-backend/src/lib.rs`)
   - `create_conversation(listing_id, other_user_id)` - Creates a new conversation
   - `send_chat_message(conversation_id, content)` - Sends a message
   - `get_conversation_messages(conversation_id)` - Gets all messages in a conversation
   - `get_user_conversations()` - Gets all conversations for the current user
   - `mark_conversation_read(conversation_id)` - Marks conversation as read
   - `set_typing_status(conversation_id, is_typing)` - Updates typing status

### Frontend Components

1. **Chat Services**
   - `chatApiService.js` - Handles backend API communication
   - `chatWebSocketService.js` - Manages WebSocket connections (ready for IC WebSocket Gateway)

2. **Chat UI Components**
   - `Chat.jsx` - Main chat page with conversation list and chat window
   - `ConversationList.jsx` - Lists all user conversations
   - `ChatWindow.jsx` - Displays messages and handles conversation interactions
   - `ChatInput.jsx` - Message input with typing status and file attachments
   - `StartChatButton.jsx` - Button to initiate conversations from listing pages

3. **State Management**
   - Updated Zustand store with chat state and actions
   - Real-time message handling and conversation updates

## Integration Steps

### 1. Add Chat Button to Listing Pages

To add a "Contact Seller" button to your listing detail pages:

```jsx
import StartChatButton from "../../common/components/StartChatButton/StartChatButton.jsx";

// In your ListingDetails component
<StartChatButton 
  listingId={listing.id}
  listingTitle={listing.title}
  ownerId={listing.owner_id}
  className="large"
/>
```

### 2. Initialize Chat System

The chat system is automatically initialized when users visit the `/chat` page. Make sure your main app includes the chat route:

```jsx
import Chat from "./pages/Chat/Chat.jsx";

// In your router
<Route path="/chat" element={<Chat />} />
<Route path="/chat/:conversationId" element={<Chat />} />
```

### 3. Configure Environment Variables

Set the backend canister ID in your environment:

```javascript
// In your .env or config
CANISTER_ID_ICP_HACKATHON_BACKEND=your-canister-id-here
```

### 4. WebSocket Gateway Setup (Future Enhancement)

The WebSocket service is ready for IC WebSocket Gateway integration. To enable real-time messaging:

1. Deploy the IC WebSocket Gateway
2. Update the `gatewayUrl` in `chatWebSocketService.js`
3. Configure gateway principals in the backend

## Current Features

✅ **Implemented:**
- Conversation creation between users for specific listings
- Message sending and receiving via backend API
- Conversation listing with unread counts
- Typing status indicators (UI ready, backend ready)
- Message read status tracking
- Real-time UI updates through Zustand store
- Integration with existing user authentication

🔄 **WebSocket Ready (Backend prepared):**
- Real-time message broadcasting
- Typing status updates
- Connection status tracking
- Auto-reconnection logic

📋 **TODO for Full WebSocket Integration:**
- Deploy IC WebSocket Gateway
- Configure gateway URLs and principals
- Enable real-time message broadcasting
- Add file/image upload functionality

## Usage Examples

### Starting a Conversation

```jsx
// From a listing page
const handleContactSeller = async () => {
  const conversationId = await createConversation(
    listing.id, 
    listing.owner_id, 
    listing.title
  );
  navigate(`/chat/${conversationId}`);
};
```

### Sending Messages

```jsx
// The ChatInput component handles this automatically
const sendMessage = async (conversationId, content) => {
  await addMessage(conversationId, {
    content,
    type: 'text'
  });
};
```

### Accessing Chat Data

```jsx
// In any component
const conversations = useStore(state => state.conversations);
const activeConversation = useStore(state => 
  state.conversations[state.activeConversationId]
);
```

## API Reference

### Backend Functions

- `create_conversation(listing_id: u64, other_user_id: String) -> Result<Conversation, String>`
- `send_chat_message(conversation_id: String, content: String) -> Result<Message, String>`
- `get_conversation_messages(conversation_id: String) -> Result<Vec<Message>, String>`
- `get_user_conversations() -> Vec<Conversation>`
- `mark_conversation_read(conversation_id: String) -> Result<(), String>`
- `set_typing_status(conversation_id: String, is_typing: bool) -> Result<(), String>`

### Frontend Store Actions

- `initializeChat(canisterId)` - Initialize chat services
- `createConversation(listingId, otherUserId, listingTitle)` - Create new conversation
- `addMessage(conversationId, message)` - Send a message
- `markConversationAsRead(conversationId)` - Mark conversation as read
- `sendTypingStatus(conversationId, isTyping)` - Send typing status

## Testing

1. **Basic Chat Flow:**
   - User A creates a conversation from a listing
   - User A sends a message
   - User B can see the conversation and respond
   - Messages persist across page reloads

2. **UI Features:**
   - Conversation list shows latest messages and timestamps
   - Unread message counts display correctly
   - Chat window scrolls to latest messages
   - Typing indicators work (when WebSocket is enabled)

## Next Steps for Production

1. **Deploy IC WebSocket Gateway**
2. **Configure HTTPS endpoints for production**
3. **Add file upload functionality**
4. **Implement message encryption for privacy**
5. **Add message search and filtering**
6. **Implement push notifications**
7. **Add user presence indicators**
8. **Scale conversation storage for large user bases**

The chat system is now fully functional for basic messaging and ready for real-time WebSocket integration when the IC WebSocket Gateway is deployed.
