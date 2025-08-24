use candid::{CandidType, decode_one, encode_one};
use ic_cdk::print;
use serde::{Deserialize, Serialize};
use ic_websocket_cdk::{
    ClientPrincipal, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
    ws_send,
};
use crate::chat::{Message, add_message_to_conversation, CONVERSATIONS};
use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static CONNECTED_CLIENTS: RefCell<HashMap<String, ClientPrincipal>> = RefCell::new(HashMap::new());
}

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct ChatMessage {
    pub message_type: String, // "chat_message", "typing_status", "user_joined", "user_left"
    pub conversation_id: String,
    pub sender_id: String,
    pub content: String,
    pub timestamp: u64,
}

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct TypingStatusMessage {
    pub message_type: String, // "typing_status"
    pub conversation_id: String,
    pub user_id: String,
    pub is_typing: bool,
}

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct AppMessage {
    pub message_type: String,
    pub data: String,
}

impl AppMessage {
    pub fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

impl ChatMessage {
    pub fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

impl TypingStatusMessage {
    pub fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

pub fn on_open(args: OnOpenCallbackArgs) {
    let client_principal = args.client_principal;
    let user_id = client_principal.to_string();
    
    print(format!("User {} connected via WebSocket", user_id));
    
    // Store the connected client
    CONNECTED_CLIENTS.with(|clients| {
        clients.borrow_mut().insert(user_id.clone(), client_principal);
    });

    // Send welcome message
    let welcome_msg = AppMessage {
        message_type: "connection_established".to_string(),
        data: "Welcome to chat!".to_string(),
    };
    
    let _ = ws_send(client_principal, welcome_msg.candid_serialize());
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let client_principal = args.client_principal;
    let user_id = client_principal.to_string();
    
    print(format!("Received message from {}", user_id));
    
    // Try to decode as AppMessage first
    if let Ok(app_msg) = decode_one::<AppMessage>(&args.message) {
        print(format!("Decoded app message: {:?}", app_msg));
        
        match app_msg.message_type.as_str() {
            "chat_message" => {
                if let Ok(chat_msg) = serde_json::from_str::<ChatMessage>(&app_msg.data) {
                    handle_chat_message(chat_msg, client_principal);
                } else {
                    print("Failed to parse chat message data");
                }
            },
            "typing_status" => {
                if let Ok(typing_msg) = serde_json::from_str::<TypingStatusMessage>(&app_msg.data) {
                    handle_typing_status(typing_msg, client_principal);
                } else {
                    print("Failed to parse typing status data");
                }
            },
            _ => {
                print(format!("Unknown message type: {}", app_msg.message_type));
            }
        }
    } else {
        print("Failed to decode message as AppMessage");
    }
}

pub fn on_close(args: OnCloseCallbackArgs) {
    let client_principal = args.client_principal;
    let user_id = client_principal.to_string();
    
    print(format!("Client {} disconnected", user_id));
    
    // Remove from connected clients
    CONNECTED_CLIENTS.with(|clients| {
        clients.borrow_mut().remove(&user_id);
    });
}

fn handle_chat_message(chat_msg: ChatMessage, sender_principal: ClientPrincipal) {
    let sender_id = sender_principal.to_string();
    
    print(format!("Handling chat message from {} in conversation {}", sender_id, chat_msg.conversation_id));
    
    // Create the message
    let message = Message::new(sender_id.clone(), chat_msg.content.clone(), "text".to_string());
    
    // Add message to conversation
    if let Err(e) = add_message_to_conversation(&chat_msg.conversation_id, message.clone()) {
        print(format!("Failed to add message to conversation: {}", e));
        return;
    }
    
    // Broadcast message to all participants in the conversation
    broadcast_to_conversation(&chat_msg.conversation_id, &ChatMessage {
        message_type: "new_message".to_string(),
        conversation_id: chat_msg.conversation_id.clone(),
        sender_id: message.sender_id,
        content: message.content,
        timestamp: message.timestamp,
    }, Some(&sender_id));
}

fn handle_typing_status(typing_msg: TypingStatusMessage, sender_principal: ClientPrincipal) {
    let sender_id = sender_principal.to_string();
    
    print(format!("Handling typing status from {} in conversation {}: {}", 
        sender_id, typing_msg.conversation_id, typing_msg.is_typing));
    
    // Update typing status in conversation
    if let Err(e) = crate::chat::update_typing_status(&typing_msg.conversation_id, &sender_id, typing_msg.is_typing) {
        print(format!("Failed to update typing status: {}", e));
        return;
    }
    
    // Broadcast typing status to other participants
    broadcast_to_conversation(&typing_msg.conversation_id, &TypingStatusMessage {
        message_type: "typing_status".to_string(),
        conversation_id: typing_msg.conversation_id.clone(),
        user_id: typing_msg.user_id,
        is_typing: typing_msg.is_typing,
    }, Some(&sender_id));
}

fn broadcast_to_conversation<T>(conversation_id: &str, message: &T, exclude_user: Option<&str>) 
where 
    T: CandidType + Clone
{
    // Get conversation participants
    let participants = CONVERSATIONS.with(|convs| {
        let convs = convs.borrow();
        if let Some(conv) = convs.get(conversation_id) {
            conv.participants.clone()
        } else {
            Vec::new()
        }
    });
    
    if participants.is_empty() {
        print(format!("No participants found for conversation {}", conversation_id));
        return;
    }
    
    // Send message to each connected participant (except sender)
    CONNECTED_CLIENTS.with(|clients| {
        let clients = clients.borrow();
        for participant_id in participants {
            if exclude_user.map_or(true, |excluded| &participant_id != excluded) {
                if let Some(client_principal) = clients.get(&participant_id) {
                    let message_bytes = encode_one(message).unwrap();
                    match ws_send(*client_principal, message_bytes) {
                        Ok(()) => {
                            print(format!("Message sent to {}", participant_id));
                        },
                        Err(e) => {
                            print(format!("Failed to send message to {}: {}", participant_id, e));
                        }
                    }
                } else {
                    print(format!("Participant {} not connected", participant_id));
                }
            }
        }
    });
}

// Public function to broadcast messages from HTTP endpoints
pub fn broadcast_message_to_conversation(conversation_id: &str, message: &Message) {
    let chat_msg = ChatMessage {
        message_type: "new_message".to_string(),
        conversation_id: conversation_id.to_string(),
        sender_id: message.sender_id.clone(),
        content: message.content.clone(),
        timestamp: message.timestamp,
    };
    
    broadcast_to_conversation(conversation_id, &chat_msg, Some(&message.sender_id));
}

pub fn broadcast_typing_status_to_conversation(conversation_id: &str, user_id: &str, is_typing: bool) {
    let typing_msg = TypingStatusMessage {
        message_type: "typing_status".to_string(),
        conversation_id: conversation_id.to_string(),
        user_id: user_id.to_string(),
        is_typing,
    };
    
    broadcast_to_conversation(conversation_id, &typing_msg, Some(user_id));
}

