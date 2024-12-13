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
                Category::new("Elektronika".to_string(), Some(vec![
                    Category::new("Telefony komórkowe".to_string(), None),
                    Category::new("Laptopy".to_string(), None),
                    Category::new("Telewizory".to_string(), None),
                    Category::new("Kamery".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Dom i ogród".to_string(), Some(vec![
                    Category::new("Meble".to_string(), None),
                    Category::new("Sprzęt AGD".to_string(), None),
                    Category::new("Narzędzia ogrodowe".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Moda".to_string(), Some(vec![
                    Category::new("Odzież".to_string(), None),
                    Category::new("Obuwie".to_string(), None),
                    Category::new("Akcesoria".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Pojazdy".to_string(), Some(vec![
                    Category::new("Samochody".to_string(), None),
                    Category::new("Motocykle".to_string(), None),
                    Category::new("Rowery".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Rolnictwo".to_string(), Some(vec![
                    Category::new("Uprawy".to_string(), None),
                    Category::new("Hodowla zwierząt".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Rękodzieło".to_string(), Some(vec![
                    Category::new("Biżuteria".to_string(), None),
                    Category::new("Dekoracje do domu".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
                Category::new("Książki".to_string(), Some(vec![
                    Category::new("Fikcja".to_string(), None),
                    Category::new("Literatura faktu".to_string(), None),
                    Category::new("Komiksy".to_string(), None),
                    Category::new("Inne".to_string(), None),
                ])),
                
            ],
        }
    }
}