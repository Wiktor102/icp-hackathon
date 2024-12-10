use candid::{CandidType, Deserialize};

#[derive(Clone, CandidType, Deserialize)]
pub struct Config {
    pub max_description_len: u16,
    pub max_title_len: u8,
    pub min_description_len: u16,
    pub min_title_len: u8
}

impl Config {
    pub fn new() -> Self {
        Self {
            max_description_len: 2000,
            max_title_len: 250,
            min_description_len: 50,
            min_title_len: 12,
        }
    }
}