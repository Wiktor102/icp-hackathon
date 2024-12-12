use candid::{CandidType, Deserialize};
use ic_cdk::api::{time};
use candid::Principal;

#[derive(Clone, CandidType, Deserialize, Debug)]
pub struct User {
    pub id: Principal,
    pub name: String,
    pub email: String,
    pub phone_number: String,
    pub company_name: String,
    pub creation_date: u64,
    pub favorites_id: Option<Vec<u64>>,
}

impl User {
    pub fn new(id: Principal, name: String, email: String, phone_number: String, company_name: String) -> Self {
        Self {
            id,
            name,
            email,
            creation_date: time(),
            phone_number,
            company_name,
            favorites_id: None,
        }
    }
}
