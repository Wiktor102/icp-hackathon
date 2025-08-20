use candid::{CandidType, Deserialize};
use ic_cdk::api::call::RejectionCode;
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WebSocketConnection {
    pub client_principal: String,
    pub is_active: bool,
}

thread_local! {
    static CONNECTIONS: RefCell<HashMap<String, WebSocketConnection>> = RefCell::new(HashMap::new());
}

pub fn add_connection(client_id: String, principal: String) -> Result<(), String> {
    CONNECTIONS.with(|connections| {
        let mut conns = connections.borrow_mut();
        conns.insert(client_id.clone(), WebSocketConnection {
            client_principal: principal,
            is_active: true,
        });
        Ok(())
    })
}

pub fn remove_connection(client_id: &str) {
    CONNECTIONS.with(|connections| {
        let mut conns = connections.borrow_mut();
        conns.remove(client_id);
    });
}

pub fn broadcast_message(message: Vec<u8>, exclude_client: Option<&str>) -> Result<(), (RejectionCode, String)> {
    CONNECTIONS.with(|connections| {
        let conns = connections.borrow();
        for (client_id, conn) in conns.iter() {
            if conn.is_active && exclude_client.map_or(true, |excluded| client_id != excluded) {
                // In a real implementation, you would send the message to each client
                ic_cdk::println!("Broadcasting to {}: {:?}", client_id, String::from_utf8_lossy(&message));
            }
        }
        Ok(())
    })
}
