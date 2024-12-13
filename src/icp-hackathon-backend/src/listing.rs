use candid::{CandidType, Deserialize};
use ic_cdk::api::{time};
use std::sync::atomic::{AtomicU64, Ordering};

use crate::User;
use crate::review::Review;
static AMOUNT_OF_LISTINGS: AtomicU64 = AtomicU64::new(0);

#[derive(Clone, CandidType, Deserialize, Debug)]
pub struct Listing {
    pub id: u64,
    pub title: String,
    pub date: u64,
    pub description: String,
    pub category: String,
    pub price: f64,
    pub amount: u32,
    pub owner: User,
    pub images: Vec<String>,
    pub categories_path: String,
    pub reviews: Option<Vec<Review>>,
}

impl Listing {
    pub fn new(
        title: String,
        description: String,
        category: String,
        price: f64,
        amount: u32,
        owner: User,
        images_strings: Vec<String>, // Pełne dane Base64
        categories_path: String,
    ) -> Self {
        Self {
            id: AMOUNT_OF_LISTINGS.fetch_add(1, Ordering::SeqCst),
            title,
            date: time(),
            description,
            category,
            price,
            amount,
            owner,
            images: images_strings,
            categories_path,
            reviews: None,
        }
    }
}

