use candid::{CandidType, Deserialize};
use ic_cdk::api::{time};
use candid::Principal;
#[derive(Clone, CandidType, Deserialize)]
pub struct User {
    pub id: Principal,
    pub name: String,
    pub email: String,
    pub creation_date: u64,
}

impl User {
    pub fn new(id: Principal, name: String, email: String) -> Self {
        Self {
            id,
            name,
            email,
            creation_date: time(),
        }
    }
}
