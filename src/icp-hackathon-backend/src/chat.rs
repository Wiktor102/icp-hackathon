use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use std::collections::HashMap;
use std::cell::RefCell;
use serde::Serialize;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Message {
    pub id: String,
    pub sender_id: String,
    pub content: String,
    pub message_type: String, // "text", "image", etc.
    pub timestamp: u64,
    pub read: bool,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Conversation {
    pub id: String,
    pub participants: Vec<String>,
    pub listing_id: u64,
    pub listing_title: String,
    pub messages: Vec<Message>,
    pub created_at: u64,
    pub last_message_time: Option<u64>,
    pub unread_counts: HashMap<String, u32>, // user_id -> unread_count
    pub typing_users: HashMap<String, bool>, // user_id -> is_typing
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct WSMessage {
    pub message_type: String,
    pub conversation_id: String,
    pub data: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TypingStatus {
    pub conversation_id: String,
    pub user_id: String,
    pub is_typing: bool,
}

impl Message {
    pub fn new(sender_id: String, content: String, message_type: String) -> Self {
        let timestamp = time();
        let id = format!("{}-{}", sender_id, timestamp);
        
        Self {
            id,
            sender_id,
            content,
            message_type,
            timestamp,
            read: false,
        }
    }
}

impl Conversation {
    pub fn new(listing_id: u64, listing_title: String, participants: Vec<String>) -> Self {
        let timestamp = time();
        let id = format!("conv-{}-{}", listing_id, timestamp);
        
        Self {
            id,
            participants: participants.clone(),
            listing_id,
            listing_title,
            messages: Vec::new(),
            created_at: timestamp,
            last_message_time: None,
            unread_counts: participants.iter().map(|p| (p.clone(), 0)).collect(),
            typing_users: HashMap::new(),
        }
    }

    pub fn add_message(&mut self, message: Message) {
        // Update unread counts for all participants except sender
        for participant in &self.participants {
            if participant != &message.sender_id {
                *self.unread_counts.entry(participant.clone()).or_insert(0) += 1;
            }
        }
        
        self.last_message_time = Some(message.timestamp);
        self.messages.push(message);
    }

    pub fn mark_as_read(&mut self, user_id: &str) {
        self.unread_counts.insert(user_id.to_string(), 0);
        
        // Mark messages as read for this user
        for message in &mut self.messages {
            if message.sender_id != user_id {
                message.read = true;
            }
        }
    }

    pub fn set_typing_status(&mut self, user_id: &str, is_typing: bool) {
        if is_typing {
            self.typing_users.insert(user_id.to_string(), true);
        } else {
            self.typing_users.remove(user_id);
        }
    }
}

// Thread-local storage for chat data
thread_local! {
    pub static CONVERSATIONS: RefCell<HashMap<String, Conversation>> = RefCell::new(HashMap::new());
    pub static USER_CONVERSATIONS: RefCell<HashMap<String, Vec<String>>> = RefCell::new(HashMap::new());
    pub static CONVERSATION_KEYS: RefCell<HashMap<String, String>> = RefCell::new(HashMap::new()); // key -> conversation_id mapping
}

pub fn get_conversation_key(listing_id: u64, user1: &str, user2: &str) -> String {
    let (a, b) = if user1 < user2 { (user1, user2) } else { (user2, user1) };
    format!("{}:{}:{}", listing_id, a, b)
}

pub fn get_or_create_conversation(listing_id: u64, listing_title: String, user1: String, user2: String) -> Conversation {
    let key = get_conversation_key(listing_id, &user1, &user2);
    
    ic_cdk::print(&format!("get_or_create_conversation: key={}, listing_id={}, user1={}, user2={}", 
        key, listing_id, user1, user2));
    
    // First check if conversation already exists via key mapping
    let existing_conv_id = CONVERSATION_KEYS.with(|keys| {
        keys.borrow().get(&key).cloned()
    });
    
    if let Some(conv_id) = existing_conv_id {
        ic_cdk::print(&format!("Found existing conversation with ID: {}", conv_id));
        // Return existing conversation
        CONVERSATIONS.with(|convs| {
            convs.borrow().get(&conv_id).cloned().unwrap()
        })
    } else {
        // Create new conversation
        let participants = vec![user1.clone(), user2.clone()];
        let conversation = Conversation::new(listing_id, listing_title, participants);
        let conv_id = conversation.id.clone();
        
        ic_cdk::print(&format!("Creating new conversation with ID: {}", conv_id));
        
        CONVERSATIONS.with(|convs| {
            convs.borrow_mut().insert(conv_id.clone(), conversation.clone());
        });
        
        CONVERSATION_KEYS.with(|keys| {
            keys.borrow_mut().insert(key, conv_id.clone());
        });
        
        // Update user conversations index
        USER_CONVERSATIONS.with(|user_convs| {
            let mut user_convs = user_convs.borrow_mut();
            user_convs.entry(user1.clone()).or_insert_with(Vec::new).push(conv_id.clone());
            user_convs.entry(user2.clone()).or_insert_with(Vec::new).push(conv_id.clone());
        });
        
        ic_cdk::print(&format!("Conversation {} stored successfully", conv_id));
        
        conversation
    }
}

pub fn add_message_to_conversation(conversation_id: &str, message: Message) -> Result<(), String> {
    CONVERSATIONS.with(|convs| {
        let mut convs = convs.borrow_mut();
        
        if let Some(conversation) = convs.get_mut(conversation_id) {
            conversation.add_message(message);
            Ok(())
        } else {
            Err("Conversation not found".to_string())
        }
    })
}

pub fn get_user_conversations(user_id: &str) -> Vec<Conversation> {
    USER_CONVERSATIONS.with(|user_convs| {
        let user_convs = user_convs.borrow();
        
        if let Some(conv_ids) = user_convs.get(user_id) {
            CONVERSATIONS.with(|convs| {
                let convs = convs.borrow();
                conv_ids.iter()
                    .filter_map(|id| convs.get(id))
                    .cloned()
                    .collect()
            })
        } else {
            Vec::new()
        }
    })
}

pub fn mark_conversation_as_read(conversation_id: &str, user_id: &str) -> Result<(), String> {
    CONVERSATIONS.with(|convs| {
        let mut convs = convs.borrow_mut();
        
        if let Some(conversation) = convs.get_mut(conversation_id) {
            conversation.mark_as_read(user_id);
            Ok(())
        } else {
            Err("Conversation not found".to_string())
        }
    })
}

pub fn update_typing_status(conversation_id: &str, user_id: &str, is_typing: bool) -> Result<(), String> {
    CONVERSATIONS.with(|convs| {
        let mut convs = convs.borrow_mut();
        
        if let Some(conversation) = convs.get_mut(conversation_id) {
            conversation.set_typing_status(user_id, is_typing);
            Ok(())
        } else {
            Err("Conversation not found".to_string())
        }
    })
}
