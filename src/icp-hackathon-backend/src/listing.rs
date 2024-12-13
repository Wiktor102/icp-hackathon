use candid::{CandidType, Deserialize};
use ic_cdk::api::{time};
use std::sync::atomic::{AtomicU64, Ordering};

use crate::User;
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
    pub images: Vec<u8>,
    pub categories_path: String,
}

impl Listing {
    pub fn new(
        title: String,
        description: String,
        category: String,
        price: f64,
        amount: u32,
        owner: User,
        images_strings: Vec<String>,
        categories_path: String
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
            images: images_strings.iter().map(|s| s.len() as u8).collect(),
            categories_path,
        }
    }
}
