use candid::{CandidType, decode_one, encode_one};
use ic_cdk::print;
use serde::{Deserialize, Serialize};
use ic_websocket_cdk::{
    ClientPrincipal, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct AppMessage {
    pub text: String,
}

impl AppMessage {
    pub fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

pub fn on_open(args: OnOpenCallbackArgs) {
    let msg = AppMessage {
        text: String::from("ping"),
    };
    print(format!("(on_open) Would send message to {:?}: {:?}", args.client_principal, msg));
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let app_msg: AppMessage = decode_one(&args.message).unwrap();
    let new_msg = AppMessage {
        text: String::from("ping"),
    };
    print(format!("Received message: {:?}", app_msg));
    print(format!("(on_message) Would send message to {:?}: {:?}", args.client_principal, new_msg));
}

pub fn on_close(args: OnCloseCallbackArgs) {
    print(format!("Client {} disconnected", args.client_principal));
}

