use candid::{CandidType, Deserialize};
use crate::category::Category;

#[derive(Clone, CandidType, Deserialize)]
pub struct Config {
    pub max_description_len: u16,
    pub max_title_len: u8,
    pub min_description_len: u16,
    pub min_title_len: u8,
    pub categories: Vec<Category>,
    pub min_user_name_len: u8,
    pub max_user_name_len: u16,
    pub min_company_name_len: u8,
    pub max_company_name_len: u16,
}

impl Config {
    pub fn new() -> Self {
        Self {
            max_description_len: 2000,
            max_title_len: 250,
            min_description_len: 50,
            min_title_len: 12,
            min_user_name_len: 5,
            max_user_name_len: 50,
            min_company_name_len: 5,
            max_company_name_len: 50,
            categories: vec![
                Category::new("Electronics".to_string(), Some(vec![
                    Category::new("Mobile Phones".to_string(), None),
                    Category::new("Laptops".to_string(), None),
                    Category::new("Television".to_string(), None),
                    Category::new("Cameras".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),
                
                Category::new("Home & Garden".to_string(), Some(vec![
                    Category::new("Furniture".to_string(), None),
                    Category::new("Appliances".to_string(), None),
                    Category::new("Gardening Tools".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),

                Category::new("Fashion".to_string(), Some(vec![
                    Category::new("Clothing".to_string(), None),
                    Category::new("Shoes".to_string(), None),
                    Category::new("Accessories".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),

                Category::new("Vehicles".to_string(), Some(vec![
                    Category::new("Cars".to_string(), None),
                    Category::new("Motorcycles".to_string(), None),
                    Category::new("Bicycles".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),

                Category::new("Agriculture".to_string(), Some(vec![
                    Category::new("Crops".to_string(), None),
                    Category::new("Animal Farming".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),

                Category::new("Hand-Made".to_string(), Some(vec![
                    Category::new("Jewelry".to_string(), None),
                    Category::new("Home Decor".to_string(), None),
                    Category::new("Other".to_string(), None),
                ])),

                Category::new("Books".to_string(), Some(vec![
                    Category::new("Fiction".to_string(), None),
                    Category::new("Non-Fiction".to_string(), None),
                    Category::new("Comics".to_string(), None),
                    Category::new("Other ".to_string(), None),
                ])),
            ],
        }
    }
}