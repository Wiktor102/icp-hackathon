use std::cell::RefCell;
use crate::listing::Listing;
use crate::config::Config;
use crate::user::User;
use crate::category::Category;

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
    price: u8,
    amount: u8,
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
fn add_user(name: String, email: String) -> Result<User, String> {
    let caller = ic_cdk::caller();
    let user = User::new(caller, name, email);

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

ic_cdk::export_candid!();

