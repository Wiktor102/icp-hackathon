use candid::{CandidType, Deserialize};
use ic_cdk::api::{time, caller};
use candid::Principal;

use crate::User;

#[derive(Clone, CandidType, Deserialize)]
pub struct Listing {
    pub title: String,
    pub date: u64,
    pub description: String,
    pub category: String,
    pub price: u8,
    pub amount: u8,
    pub owner: User,
    pub images: Vec<u8>,
}

impl Listing {
    pub fn new(
        title: String,
        description: String,
        category: String,
        price: u8,
        amount: u8,
        owner: User,
        images_strings: Vec<String>,
    ) -> Self {
        Self {
            title,
            date: time(),
            description,
            category,
            price,
            amount,
            owner,
            images: images_strings.iter().map(|s| s.len() as u8).collect(),
        }
    }
}
