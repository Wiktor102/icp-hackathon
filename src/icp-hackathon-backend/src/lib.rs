use std::cell::RefCell;
use crate::listing::Listing;
use crate::config::Config;
use crate::user::User;
use crate::category::Category;
use crate::review::Review;
use candid::{self, CandidType, Deserialize};
use std::collections::HashMap;
use base64::Engine;

mod category;
mod listing;
mod config;
mod user;
mod review;

// This code is from docs.identitykit

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug)]
pub struct SupportedStandard {
    pub url: String,
    pub name: String,
}

#[ic_cdk::update]
fn icrc10_supported_standards() -> Vec<SupportedStandard> {
    vec![
        SupportedStandard {
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md".to_string(),
            name: "ICRC-10".to_string(),
        },
        SupportedStandard {
            url: "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_28_trusted_origins.md".to_string(),
            name: "ICRC-28".to_string(),
        },
    ]
}
 
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Icrc28TrustedOriginsResponse {
    pub trusted_origins: Vec<String>
}
 
// list every base URL that users will authenticate to your app from
#[ic_cdk::update]
fn icrc28_trusted_origins() -> Icrc28TrustedOriginsResponse {
    let trusted_origins = vec![
        String::from("https://your-frontend-canister-id.icp0.io"),
        String::from("https://your-frontend-canister-id.raw.icp0.io"),
        String::from("https://your-frontend-canister-id.ic0.app"),
        String::from("https://your-frontend-canister-id.raw.ic0.app"),
        String::from("https://your-frontend-canister-id.icp0.icp-api.io"),
        String::from("https://your-frontend-canister-id.icp-api.io"),
        String::from("https://yourcustomdomain.com"),
        String::from("https://yourothercustomdomain.com")
    ];
 
    return Icrc28TrustedOriginsResponse { trusted_origins }
}

// end of code from docs.identitykit

thread_local! {
    static CONFIG: RefCell<Config> = RefCell::new(Config::new());
    static LISTINGS: RefCell<Vec<Listing>> = RefCell::new(Vec::new());
    static USERS: RefCell<Vec<User>> = RefCell::new(Vec::new());
    static IMAGES: RefCell<Vec<String>> = RefCell::new(Vec::new());
    static CHATS: RefCell<HashMap<u64, Chat>> = RefCell::new(HashMap::new());
    static CHAT_ID_COUNTER: RefCell<u64> = RefCell::new(0);
}


#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Message {
    pub sender_id: String,
    pub content: String,
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Chat {
    pub id: u64,
    pub listing_id: u64,
    pub user1: String,
    pub user2: String,
    pub messages: Vec<Message>,
}

// Helper to get a unique chat id
fn next_chat_id() -> u64 {
    CHAT_ID_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        *c
    })
}

// Helper to get chat key (listing_id + user1 + user2, sorted)
fn chat_key(listing_id: u64, user1: &str, user2: &str) -> String {
    let (a, b) = if user1 < user2 { (user1, user2) } else { (user2, user1) };
    format!("{}:{}:{}", listing_id, a, b)
}

// Map from chat_key to chat_id for fast lookup
thread_local! {
    static CHAT_KEYS: RefCell<HashMap<String, u64>> = RefCell::new(HashMap::new());
}

// Get or create a chat for two users and a listing
#[ic_cdk::update]
fn get_or_create_chat(listing_id: u64, other_user_id: String) -> Chat {
    let caller = ic_cdk::caller().to_string();
    let key = chat_key(listing_id, &caller, &other_user_id);

    let chat_id = CHAT_KEYS.with(|keys| {
        let mut keys = keys.borrow_mut();
        if let Some(&id) = keys.get(&key) {
            id
        } else {
            let id = next_chat_id();
            keys.insert(key.clone(), id);
            id
        }
    });

    CHATS.with(|chats| {
        let mut chats = chats.borrow_mut();
        chats.entry(chat_id).or_insert_with(|| Chat {
            id: chat_id,
            listing_id,
            user1: caller.clone(),
            user2: other_user_id.clone(),
            messages: Vec::new(),
        }).clone()
    })
}

// Send a message in a chat (creates chat if not exists)
#[ic_cdk::update]
fn send_message(listing_id: u64, to_user_id: String, content: String) -> Result<Message, String> {
    let sender_id = ic_cdk::caller().to_string();
    if sender_id == to_user_id {
        return Err("Cannot send message to yourself.".to_string());
    }
    let key = chat_key(listing_id, &sender_id, &to_user_id);

    let chat_id = CHAT_KEYS.with(|keys| {
        let mut keys = keys.borrow_mut();
        if let Some(&id) = keys.get(&key) {
            id
        } else {
            let id = next_chat_id();
            keys.insert(key.clone(), id);
            id
        }
    });

    let msg = Message {
        sender_id: sender_id.clone(),
        content,
        timestamp: ic_cdk::api::time(),
    };

    CHATS.with(|chats| {
        let mut chats = chats.borrow_mut();
        let chat = chats.entry(chat_id).or_insert_with(|| Chat {
            id: chat_id,
            listing_id,
            user1: sender_id.clone(),
            user2: to_user_id.clone(),
            messages: Vec::new(),
        });
        chat.messages.push(msg.clone());
        chat.clone()
    });

    // TODO: Integrate with ic-websocket-gateway for real-time notification

    Ok(msg)
}

// Get all messages for a chat (between caller and other user for a listing)
#[ic_cdk::query]
fn get_messages(listing_id: u64, other_user_id: String) -> Vec<Message> {
    let caller = ic_cdk::caller().to_string();
    let key = chat_key(listing_id, &caller, &other_user_id);

    let chat_id_opt = CHAT_KEYS.with(|keys| keys.borrow().get(&key).cloned());
    if let Some(chat_id) = chat_id_opt {
        CHATS.with(|chats| {
            chats.borrow().get(&chat_id).map(|c| c.messages.clone()).unwrap_or_default()
        })
    } else {
        Vec::new()
    }
}

// Optionally: get all chats for the active user
#[ic_cdk::query]
fn get_chats_for_active_user() -> Vec<Chat> {
    let caller = ic_cdk::caller().to_string();
    CHATS.with(|chats| {
        chats.borrow().values()
            .filter(|chat| chat.user1 == caller || chat.user2 == caller)
            .cloned()
            .collect()
    })
}

#[ic_cdk::update]
fn add_listing(
    title: String,
    description: String,
    category: String,
    price: f64,
    amount: u32,
    images_strings: Vec<String>,
    categories_path: String,
) -> Result<Listing, String> {
    let caller = ic_cdk::caller().to_string();
    let owner = USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    });

    if let Some(_owner) = owner {
        let config = CONFIG.with(|config| config.borrow().clone());

        let images_id = IMAGES.with(|images| {
            let mut images_ref = images.borrow_mut();
            images_strings.iter().map(|s| {
                images_ref.push(base64::engine::general_purpose::STANDARD.encode(s));
                (images_ref.len() - 1) as u64
            }).collect::<Vec<u64>>()
        });


        
        if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize {
            return Err("Długość tytułu jest poza zakresem!".to_string());
        }
        if description.len() > config.max_description_len as usize || description.len() < config.min_description_len as usize {
            return Err("Długość opisu jest poza zakresem!".to_string());
        }

        let listing = Listing::new(
            title,
            description,
            category,
            price,
            amount,
            caller,
            images_id, 
            categories_path,
        );

        LISTINGS.with(|listings| listings.borrow_mut().push(listing.clone()));

        Ok(listing)
    } else {
        Err("Nie znaleziono użytkownika!".to_string())
    }
}

#[ic_cdk::update]
fn edit_listing(
    id: u64,
    title: String,
    description: String,
    category: String,
    price: f64,
    amount: u32,
    images_strings: Vec<String>, 
    categories_path: String,
) -> Result<String, String> {
    let caller = ic_cdk::caller().to_string();
    let config = CONFIG.with(|config| config.borrow().clone());

    let images_id = IMAGES.with(|images| {
        let mut images_ref = images.borrow_mut();
        images_strings.iter().map(|s| {
            images_ref.push(base64::engine::general_purpose::STANDARD.encode(s));
            (images_ref.len() - 1) as u64
        }).collect::<Vec<u64>>()
    });

    if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize {
        return Err("Długość tytułu jest nieprawidłowa!".to_string());
    }
    if description.len() > config.max_description_len as usize || description.len() < config.min_description_len as usize {
        return Err("Długość opisu jest nieprawidłowa!".to_string());
    }

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        if let Some(listing) = listings.iter_mut().find(|listing| listing.id == id) {
            if listing.owner_id != caller {
                return Err("Brak uprawnień: Nie jesteś właścicielem tego ogłoszenia.".to_string());
            }

            listing.title = title;
            listing.description = description;
            listing.category = category;
            listing.price = price;
            listing.amount = amount;
            listing.categories_path = categories_path;
            listing.images_id = images_id;

            Ok("Ogłoszenie zostało pomyślnie zaktualizowane!".to_string())
        } else {
            Err("Nie znaleziono ogłoszenia!".to_string())
        }
    })
}
#[ic_cdk::query]
fn get_image_by_id(image_id: u64) -> Option<String> {
    IMAGES.with(|images| {
        images.borrow().get(image_id as usize).cloned()
    })
}


#[ic_cdk::query]
fn get_listings_id_by_category(category: String) -> Vec<usize> {
    LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .enumerate()
            .filter(|(_, listing)| listing.category == category)
            .map(|(index, _)| index)
            .collect()
    })
}


#[ic_cdk::query]
fn get_listings_by_id(ids: Vec<u64>) -> Vec<Listing> {
    LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .filter(|listing| ids.contains(&listing.id))
            .cloned()
            .collect()
    })
}


#[ic_cdk::update]
fn delete_listing(id: u64) -> Option<String> {
    let caller = ic_cdk::caller().to_string();

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        if let Some(index) = listings.iter().position(|listing| listing.id == id) {
            if listings[index].owner_id != caller {
                return Some("Brak uprawnień: Nie jesteś właścicielem tego ogłoszenia.".to_string());
            }

            listings.remove(index);
            None
        } else {
            Some("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}

#[ic_cdk::query]
fn get_listings() -> Vec<Listing> {
    LISTINGS.with(|listings| listings.borrow().clone())
}

#[ic_cdk::query]
fn get_listing_by_id(id: u64) -> Option<Listing> {
    LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .find(|listing| listing.id == id)
            .cloned()
    })
}

#[ic_cdk::query]
fn get_config() -> Config {
    CONFIG.with(|config| config.borrow().clone())
}

#[ic_cdk::query]
fn get_categories() -> Vec<Category> {
    let config = CONFIG.with(|config| config.borrow().clone());
    config.categories
}

#[ic_cdk::update]
fn add_user(name: String, email: String, phone_number: String, company_name: String) -> Result<User, String> {
    let caller = ic_cdk::caller().to_string();  // Zamieniamy Principal na String
    
    if USERS.with(|users| users.borrow().iter().any(|user| user.id == caller)) {
        return Err("Użytkownik już istnieje!".to_string());
    }

    let user = User::new(caller, name.clone(), email.clone(), phone_number.clone(), company_name.clone());
    USERS.with(|users| users.borrow_mut().push(user.clone()));

    Ok(user)
}

#[ic_cdk::update]
fn add_empty_user() -> Result<User, String> {
    let caller = ic_cdk::caller().to_string();  // Zamieniamy Principal na String

    if USERS.with(|users| users.borrow().iter().any(|user| user.id == caller)) {
        return Err("Użytkownik już istnieje!".to_string());
    }

    let user = User::new(caller, "".to_string(), "".to_string(), "".to_string(), "".to_string());
    USERS.with(|users| users.borrow_mut().push(user.clone()));
    Ok(user)
}


#[ic_cdk::query]
fn get_users() -> Vec<User> {
    USERS.with(|users| users.borrow().clone())
}

#[ic_cdk::query]
fn get_user_by_principal(principal: String) -> Option<User> {
    USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == principal).cloned()
    })
}

#[ic_cdk::query]
fn get_active_user() -> Option<User> {
    let caller = ic_cdk::caller().to_string();
    USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    })
}

#[ic_cdk::update]
fn edit_active_user(name: String, email: String, phone_number: String, company_name: String) -> Option<String> {
    let caller = ic_cdk::caller().to_string();  // Zamieniamy Principal na String

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {
            user.name = name;
            user.email = email;
            user.phone_number = phone_number;
            user.company_name = company_name;
            return None;
        }

        Some("Nie znaleziono użytkownika!".to_string())
    })
}


#[ic_cdk::update]
fn add_favorite_listing(listing_id: u64) {
    let caller = ic_cdk::caller().to_string();  // Zamieniamy Principal na String

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {
            LISTINGS.with(|listings| {
                if let Some(listing) = listings.borrow().iter().find(|listing| listing.id == listing_id) {
                    if caller == listing.owner_id {
                        return;
                    }
                    if user.favorites_id.is_none() {
                        user.favorites_id = Some(vec![listing.id]);
                    } else {
                        user.favorites_id.as_mut().unwrap().push(listing.id);
                    }
                }
            });
        }
    });
}

#[ic_cdk::query]
fn get_active_user_favorite_listings() -> Vec<Listing> {
    let user = get_active_user();
    let mut favorites = Vec::new();
    if let Some(user) = user {
        if let Some(favorites_id) = user.favorites_id {
            LISTINGS.with(|listings| {
                for listing_id in favorites_id {
                    if let Some(listing) = listings.borrow().iter().find(|listing| listing.id == listing_id) {
                        favorites.push(listing.clone());
                    }
                }
            });
        }
    }
    favorites
}

#[ic_cdk::query]
fn get_listings_by_active_user() -> Result<Vec<Listing>, String> {
    let caller = ic_cdk::caller().to_string();  // Zamieniamy Principal na String

    let owner = USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    });

    if owner.is_none() {
        return Err("Nie znaleziono użytkownika!".to_string());
    }

    let user_listings = LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .filter(|listing| listing.owner_id == caller)
            .cloned()
            .collect()
    });
    Ok(user_listings)
}

#[ic_cdk::query]
fn get_reviews_of_listing(listing_id: u64) -> Result<Vec<Review>, String> {
    LISTINGS.with(|listings| {
        let listings = listings.borrow();
        
        if let Some(listing) = listings.iter().find(|listing| listing.id == listing_id) {
            if let Some(reviews) = &listing.reviews {
                Ok(reviews.clone())
            } else {
                Err("Brak opinii dla tego ogłoszenia.".to_string())
            }
        } else {
            Err("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}

#[ic_cdk::query]
fn calculate_average_rating_of_listing(listing_id: u64) -> Result<f64, String> {
    LISTINGS.with(|listings| {
        let listings = listings.borrow();

        if let Some(listing) = listings.iter().find(|listing| listing.id == listing_id) {
            if let Some(reviews) = &listing.reviews {
                if reviews.is_empty() {
                    return Err("Brak opinii dla tego ogłoszenia.".to_string());
                }

                let total_rating: u32 = reviews.iter().map(|review| review.rating as u32).sum();
                let average_rating = total_rating as f64 / reviews.len() as f64;

                Ok(average_rating)
            } else {
                Err("Brak opinii dla tego ogłoszenia.".to_string())
            }
        } else {
            Err("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}

#[ic_cdk::update]
fn add_review(listing_id: u64, rating: u8, comment: String) -> Result<Review, String> {
    let caller = ic_cdk::caller().to_string();

    // Walidacja oceny
    if rating > 5 {
        return Err("Ocena musi być w zakresie od 0 do 5.".to_string());
    }

    // Sprawdzenie, czy użytkownik istnieje
    let user_exists = USERS.with(|users| users.borrow().iter().any(|user| user.id == caller));
    if !user_exists {
        return Err("Nie znaleziono użytkownika.".to_string());
    }

    // Operacje na liście ogłoszeń
    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        // Znajdź ogłoszenie
        let listing = listings.iter_mut().find(|listing| listing.id == listing_id);
        if let Some(listing) = listing {
            // Sprawdzenie, czy użytkownik nie jest właścicielem ogłoszenia
            if listing.owner_id == caller {
                return Err("Nie możesz wystawić opinii pod własnym ogłoszeniem.".to_string());
            }

            // Sprawdzenie, czy użytkownik już dodał opinię
            if let Some(reviews) = &listing.reviews {
                if reviews.iter().any(|review| review.owner_id == caller) {
                    return Err("Już dodałeś opinię dla tego ogłoszenia.".to_string());
                }
            }

            // Dodanie nowej opinii
            let review = Review::new(caller, rating, comment);
            if let Some(reviews) = &mut listing.reviews {
                reviews.push(review.clone());
            } else {
                listing.reviews = Some(vec![review.clone()]);
            }
            return Ok(review); // Zwrócenie nowej opinii
        }
        Err("Nie znaleziono ogłoszenia.".to_string()) // Jeśli ogłoszenie nie istnieje
    })
}


#[ic_cdk::update]
fn edit_review(listing_id: u64, rating: u8, comment: String) -> Option<String> {
    let caller = ic_cdk::caller().to_string();

    if rating > 5 {
        return Some("Ocena musi być w zakresie od 0 do 5.".to_string());
    }

    let owner = USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    });

    if owner.is_none() {
        return Some("Nie znaleziono użytkownika!".to_string());
    }

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();
        if let Some(listing) = listings.iter_mut().find(|listing| listing.id == listing_id) {
            if let Some(ref mut reviews) = listing.reviews {
                if let Some(review) = reviews.iter_mut().find(|review| review.owner_id == caller) {
                    review.rating = rating;
                    review.comment = comment;
                    return None;
                }
            }
            Some("Nie znaleziono opinii.".to_string())
        } else {
            Some("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}

#[ic_cdk::update]
fn delete_review(listing_id: u64) -> Option<String> {
    let caller = ic_cdk::caller().to_string();
    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();
        if let Some(listing) = listings.iter_mut().find(|listing| listing.id == listing_id) {
            if let Some(ref mut reviews) = listing.reviews {
                if let Some(index) = reviews.iter().position(|review| review.owner_id == caller) {
                    reviews.remove(index);
                    return None;
                }
            }
            Some("Nie znaleziono opinii.".to_string())
        } else {
            Some("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}
// REMOVE the following block unless you have the ic-websocket-gateway crate and want to implement it now:
/*
use ic_cdk::export::candid;
use ic_cdk::export::Principal;
use ic_websocket_gateway::{
    CanisterWsCloseArguments, CanisterWsMessageArguments, CanisterWsOpenArguments,
    CanisterWsSendResult, WsHandlers, WsInitParams, ws_init, ws_open, ws_message, ws_close,
};

thread_local! {
    static WS_HANDLERS: WsHandlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };
}

#[ic_cdk::init]
fn init() {
    let params = WsInitParams {
        max_connections: Some(100),
        max_message_size_bytes: Some(1024 * 64),
        ..Default::default()
    };
    WS_HANDLERS.with(|h| ws_init(params, h.clone()));
}

#[ic_cdk::update]
fn ws_open(args: CanisterWsOpenArguments) {
    ws_open(args);
}

#[ic_cdk::update]
fn ws_message(args: CanisterWsMessageArguments) -> CanisterWsSendResult {
    ws_message(args)
}

#[ic_cdk::update]
fn ws_close(args: CanisterWsCloseArguments) {
    ws_close(args);
}

// Obsługa zdarzeń WebSocket
fn on_open(client_principal: Principal) {
    ic_cdk::println!("Nowe połączenie: {:?}", client_principal);
}

fn on_message(client_principal: Principal, msg: Vec<u8>) {
    ic_cdk::println!("Wiadomość od {:?}: {:?}", client_principal, msg);
}

fn on_close(client_principal: Principal) {
    ic_cdk::println!("Połączenie zamknięte: {:?}", client_principal);
}
*/

candid::export_service!();

