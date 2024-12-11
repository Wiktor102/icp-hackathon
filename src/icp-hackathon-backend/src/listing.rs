use candid::{CandidType, Deserialize};
use ic_cdk::api::{time, caller};
use candid::Principal;
#[derive(Clone, CandidType, Deserialize)]
pub struct Listing {
    pub title: String,
    pub date: u64,
    pub description: String,
    pub category: String,
    pub price: u8,
    pub amount: u8,
    pub owner: Principal,
}

impl Listing {
    pub fn new(
        title: String,
        description: String,
        category: String,
        price: u8,
        amount: u8,
        owner: Principal,
    ) -> Self {
        Self {
            title,
            date: time(),
            description,
            category,
            price,
            amount,
            owner,
        }
    }
}
