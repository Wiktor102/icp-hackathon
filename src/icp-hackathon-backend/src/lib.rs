use std::cell::RefCell;
use crate::listing::Listing;
use crate::config::Config;
use crate::user::User;
use crate::category::Category;
use crate::review::Review;
use regex::Regex;
use candid::{self, CandidType, Deserialize};

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
}
#[ic_cdk::update]
fn add_listing(
    title: String,
    description: String,
    category: String,
    price: f64,
    amount: u32,
    images: Vec<String>,
    categories_path: String,
) -> Result<Listing, String> {
    let caller = ic_cdk::caller();
    
    let owner = USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    });

    if let Some(owner) = owner {
        let config = CONFIG.with(|config| config.borrow().clone());

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
            owner,
            images, 
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
    let caller = ic_cdk::caller();

    let config = CONFIG.with(|config| config.borrow().clone());
    if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize {
        return Err("Długość tytułu jest nieprawidłowa!".to_string());
    }
    if description.len() > config.max_description_len as usize || description.len() < config.min_description_len as usize {
        return Err("Długość opisu jest nieprawidłowa!".to_string());
    }

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        if let Some(listing) = listings.iter_mut().find(|listing| listing.id == id) {

            if listing.owner.id != caller {
                return Err("Brak uprawnień: Nie jesteś właścicielem tego ogłoszenia.".to_string());
            }

            listing.title = title;
            listing.description = description;
            listing.category = category;
            listing.price = price;
            listing.amount = amount;
            listing.categories_path = categories_path;

            listing.images = images_strings;

            Ok("Ogłoszenie zostało pomyślnie zaktualizowane!".to_string())
        } else {
            Err("Nie znaleziono ogłoszenia!".to_string())
        }
    })
}



#[ic_cdk::query]
fn search_listings_by_keyword(keyword: String) -> Vec<Listing> {
    LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .filter(|listing| {
                listing.title.contains(&keyword) || listing.description.contains(&keyword)
            })
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_listings_by_category(category: String) -> Vec<Listing> {
    LISTINGS.with(|listings| {
        listings
            .borrow()
            .iter()
            .filter(|listing| listing.category == category)
            .cloned()
            .collect()
    })
}

#[ic_cdk::update]
fn delete_listing(id: u64) -> Option<String> {
    let caller = ic_cdk::caller();

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        if let Some(index) = listings.iter().position(|listing| listing.id == id) {
            if listings[index].owner.id != caller {
                return Some("Brak uprawnień: Nie jesteś właścicielem tego ogłoszenia.".to_string());
            }

            listings.remove(index);
            return None;
        } else {
            return Some("Nie znaleziono ogłoszenia.".to_string());
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
    let caller = ic_cdk::caller();
    
    if USERS.with(|users| users.borrow().iter().any(|user| user.id == caller)) {
        return Err("Użytkownik już istnieje!".to_string());
    }

    let user = User::new(caller, name.clone(), email.clone(), phone_number.clone(), company_name.clone());
    
    let config = CONFIG.with(|config| config.borrow().clone());

    if name.len() < config.min_user_name_len as usize || name.len() > config.max_user_name_len as usize {
        return Err("Długość nazwy jest nieprawidłowa!".to_string());
    }

    let email_regex = Regex::new(r"^([a-z0-9_+]([a-z0-9_+.]*[a-z0-9_+])?)@([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})").unwrap();
    if !email_regex.is_match(&email) {
        return Err("Nieprawidłowy format adresu e-mail!".to_string());
    }

    let phone_number_regex = Regex::new(r"^\d{9}$").unwrap();
    if !phone_number_regex.is_match(&phone_number) {
        return Err("Nieprawidłowy format numeru telefonu!".to_string());
    }

    if company_name.len() < config.min_company_name_len as usize || company_name.len() > config.max_company_name_len as usize {
        return Err("Długość nazwy firmy jest nieprawidłowa!".to_string());
    }

    USERS.with(|users| users.borrow_mut().push(user.clone()));

    Ok(user)
}

#[ic_cdk::update]
fn add_empty_user() -> Result<User, String> {
    let caller = ic_cdk::caller();

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
fn get_active_user() -> Option<User> {
    let caller = ic_cdk::caller();
    USERS.with(|users| {
        users.borrow().iter().find(|user| user.id == caller).cloned()
    })
}

#[ic_cdk::update]
fn edit_active_user(name: String, email: String, phone_number: String, company_name: String) -> Option<String> {
    let caller = ic_cdk::caller();
    let config = CONFIG.with(|config| config.borrow().clone());

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {

            if name.len() < config.min_user_name_len as usize || name.len() > config.max_user_name_len as usize {
                return Some("Długość nazwy jest nieprawidłowa!".to_string());
            }

            let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
            if !email_regex.is_match(&email) {
                return Some("Nieprawidłowy format adresu e-mail!".to_string());
            }

            let phone_number_regex = Regex::new(r"^\d{9}$").unwrap();
            if !phone_number_regex.is_match(&phone_number) {
                return Some("Nieprawidłowy format numeru telefonu!".to_string());
            }

            if company_name.len() < config.min_company_name_len as usize || company_name.len() > config.max_company_name_len as usize {
                return Some("Długość nazwy firmy jest nieprawidłowa!".to_string());
            }

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
    let caller = ic_cdk::caller();

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {
            LISTINGS.with(|listings| {
                if let Some(listing) = listings.borrow().iter().find(|listing| listing.id == listing_id) {
                    if caller == listing.owner.id {
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
    let caller = ic_cdk::caller();

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
            .filter(|listing| listing.owner.id == caller)
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
fn add_review(listing_id: u64, rating: u8, comment: String) -> Option<String> {
    let caller = ic_cdk::caller();

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
           
            if let Some(reviews) = &listing.reviews {
                if reviews.iter().any(|review| review.owner_id == caller) {
                    return Some("Już dodałeś opinię dla tego ogłoszenia.".to_string());
                }
            }

            let review = Review::new(caller, rating, comment);

            if let Some(ref mut reviews) = listing.reviews {
                reviews.push(review);
            } else {
                listing.reviews = Some(vec![review]);
            }

            None
        } else {
            Some("Nie znaleziono ogłoszenia.".to_string())
        }
    })
}

#[ic_cdk::update]
fn edit_review(listing_id: u64, rating: u8, comment: String) -> Option<String> {
    let caller = ic_cdk::caller();

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
    let caller = ic_cdk::caller();
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



ic_cdk::export_candid!();

