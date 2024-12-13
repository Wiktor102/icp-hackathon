use std::cell::RefCell;
use crate::listing::Listing;
use crate::config::Config;
use crate::user::User;
use crate::category::Category;
use regex::Regex;
use candid::{self, CandidType, Deserialize};
mod category;
mod listing;
mod config;
mod user;

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

    if owner.is_none() {
        return Err("User not found!".to_string());
    }
    let config = CONFIG.with(|config| config.borrow().clone());

    if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize {
        return Err("Title len is wrong!".to_string());
    }
    if description.len() > config.max_description_len as usize
        || description.len() < config.min_description_len as usize
    {
        return Err("Desc len is wrong!".to_string());
    }

    let listing = Listing::new(title, description, category, price, amount, owner.unwrap(), images, categories_path);
    LISTINGS.with(|listings| listings.borrow_mut().push(listing.clone()));

    Ok(listing)
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
    let caller = ic_cdk::caller(); // Get the Principal of the caller

    // Check config limits
    let config = CONFIG.with(|config| config.borrow().clone());
    if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize {
        return Err("Title length is invalid!".to_string());
    }
    if description.len() > config.max_description_len as usize || description.len() < config.min_description_len as usize {
        return Err("Description length is invalid!".to_string());
    }

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        // Find the listing by id
        if let Some(listing) = listings.iter_mut().find(|listing| listing.id == id) {
            // Check if the caller is the owner
            if listing.owner.id != caller {
                return Err("Permission denied: You are not the owner of this listing.".to_string());
            }

            // Update the listing fields
            listing.title = title;
            listing.description = description;
            listing.category = category;
            listing.price = price;
            listing.amount = amount;
            listing.images = images_strings.iter().map(|s| s.len() as u64).collect();
            listing.categories_path = categories_path;

            Ok("Listing updated successfully!".to_string())
        } else {
            Err("Listing not found!".to_string())
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
fn delete_listing(id: u64) -> Result<String, String> {
    let caller = ic_cdk::caller(); // Get the Principal of the caller

    LISTINGS.with(|listings| {
        let mut listings = listings.borrow_mut();

        // Find the index of the listing by id
        if let Some(index) = listings.iter().position(|listing| listing.id == id) {
            // Check if the caller is the owner
            if listings[index].owner.id != caller {
                return Err("Permission denied: You are not the owner of this listing.".to_string());
            }

            // Remove the listing
            listings.remove(index);
            Ok("Listing deleted successfully!".to_string())
        } else {
            Err("Listing not found!".to_string())
        }
    })
}

#[ic_cdk::query]
fn get_listings() -> Vec<Listing> {
    LISTINGS.with(|listings| listings.borrow().clone())
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
        return Err("User already exists!".to_string());
    }

    let user = User::new(caller, name.clone(), email.clone(), phone_number.clone(), company_name.clone());
    
    let config = CONFIG.with(|config| config.borrow().clone());

    if name.len() < config.min_user_name_len as usize || name.len() > config.max_user_name_len as usize {
        return Err("Name length is wrong!".to_string());
    }

    let email_regex = Regex::new(r"^([a-z0-9_+]([a-z0-9_+.]*[a-z0-9_+])?)@([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})").unwrap();
    if !email_regex.is_match(&email) {
        return Err("Wrong email format!".to_string());
    }

    let phone_number_regex = Regex::new(r"^\d{9}$").unwrap();
    if !phone_number_regex.is_match(&phone_number) {
        return Err("Wrong phone number format!".to_string());
    }

    if company_name.len() < config.min_company_name_len as usize || company_name.len() > config.max_company_name_len as usize {
        return Err("Company name length is wrong!".to_string());
    }

    USERS.with(|users| users.borrow_mut().push(user.clone()));

    Ok(user)
}

#[ic_cdk::update]
fn add_empty_user() -> Result<User, String>
{
    let caller = ic_cdk::caller();

    if USERS.with(|users| users.borrow().iter().any(|user| user.id == caller)) {
        return Err("User already exists!".to_string());
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

    // Pobieramy mutowalną referencję do USERS
    USERS.with(|users| {
        let mut users = users.borrow_mut();

        // Znajdź użytkownika na podstawie 'caller'
        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {
            // Walidacja danych

            // Walidacja długości imienia
            if name.len() < config.min_user_name_len as usize || name.len() > config.max_user_name_len as usize {
                Some( "Name length is wrong!".to_string() );
            }

            // Walidacja formatu emaila
            let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
            if !email_regex.is_match(&email) {
                Some( "Wrong email format!".to_string());
            }

            // Walidacja formatu numeru telefonu
            let phone_number_regex = Regex::new(r"^\d{9}$").unwrap();
            if !phone_number_regex.is_match(&phone_number) {
                Some( "Wrong phone number format!".to_string());
            }

            // Walidacja długości nazwy firmy
            if company_name.len() < config.min_company_name_len as usize || company_name.len() > config.max_company_name_len as usize {
                Some( "Company name length is wrong!".to_string());
            }

            // Zalogowanie przed aktualizacją
            // Aktualizacja danych użytkownika
            user.name = name;
            user.email = email;
            user.phone_number = phone_number;
            user.company_name = company_name;

            return None
        }

        // Jeśli użytkownik nie został znaleziony
        Some("User not found!".to_string())
    })
}
#[ic_cdk::update]
fn add_favorite_listing(listing_id: u64)
{
    let caller = ic_cdk::caller();
    let config = CONFIG.with(|config| config.borrow().clone());

    // Pobieramy mutowalną referencję do USERS
    USERS.with(|users| {
        let mut users = users.borrow_mut();

        // Znajdź użytkownika na podstawie 'caller'
        if let Some(user) = users.iter_mut().find(|user| user.id == caller) {
            // Znajdź ogłoszenie na podstawie 'listing_id'
            LISTINGS.with(|listings| {
                if let Some(listing) = listings.borrow().iter().find(|listing| listing.id == listing_id) {
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
    return favorites;
}

ic_cdk::export_candid!();

