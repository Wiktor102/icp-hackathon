use candid::{CandidType, Deserialize};

#[derive(Clone, CandidType, Deserialize)]
pub struct Category {
    pub name: String,
    pub lower_categories: Option<Vec<Category>>,
}

impl Category {
    pub fn new(name: String, lower_categories: Option<Vec<Category>>) -> Self {
        Self {
            name,
            lower_categories,
        }
    }
}