use candid::{CandidType, Deserialize};
use ic_cdk::api::time;

#[derive(Clone, CandidType, Deserialize)]
pub struct Listing {
    title: String,
    date: u64,
    description: String,
    category: String,
    price: u8,
    amount: u8,
}

impl Listing {
    pub fn new(title: String, description: String, category: String, price: u8, amount: u8) -> Self {
        Self {
            title,
            date: time(),
            description,
            category,
            price,
            amount,
        }
    }
}
