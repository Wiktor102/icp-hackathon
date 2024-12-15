use base64;
use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use std::sync::atomic::{AtomicU64, Ordering};
use crate::review::Review;
use candid::Principal;

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
    pub owner_id: String,
    pub images_id: Vec<u64>,
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
        owner_id: String,
        images_id: Vec<u64>,
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
            owner_id,
            images_id,
            categories_path,
            reviews: None,
        }
    }
}
