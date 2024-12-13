use candid::{CandidType, Deserialize};
use candid::Principal;

#[derive(Clone, CandidType, Deserialize, Debug)]
pub struct Review {
    pub owner_id: Principal,
    pub rating: u8, //0-5
    pub comment: String,
}

impl Review {
    pub fn new(owner_id: Principal, rating: u8, comment: String) -> Self {
        Self {
            owner_id,
            rating,
            comment,
        }
    }
}