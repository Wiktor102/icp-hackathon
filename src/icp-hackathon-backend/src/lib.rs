use std::cell::RefCell;
use crate::listing::Listing;
use crate::config::Config;

mod listing;
mod config;

thread_local! {
    static CONFIG: RefCell<Config> = RefCell::new(Config::new());
    static LISTINGS: RefCell<Vec<Listing>> = RefCell::new(Vec::new());
}
#[ic_cdk::update]
fn add_listing(title: String, description: String, category: String, price: u8, amount: u8) -> Result<Listing, String>{
    let config = CONFIG.with(|config| config.borrow().clone());
    if title.len() > config.max_title_len as usize || title.len() < config.min_title_len as usize{
        return Err("Title len is wrong!".to_string())
    }
    if description.len() > config.max_description_len as usize || description.len() < config.min_description_len as usize {
        return Err("Desc len is wrong!".to_string())
    }
    let listing = Listing::new(title, description, category, price, amount);
    LISTINGS.with(|listings| listings.borrow_mut().push(listing));
    let last_listing = LISTINGS.with(|listings| 
        listings
        .borrow()
        .last()
        .expect("Vec should not be empty").clone());
    Ok(last_listing)
}

#[ic_cdk::query]
fn get_listings() -> Vec<Listing> {
    LISTINGS.with(|listings| listings.borrow().clone())
}
#[ic_cdk::query]
fn get_config() -> Config {
    CONFIG.with(|config| config.borrow().clone())
}