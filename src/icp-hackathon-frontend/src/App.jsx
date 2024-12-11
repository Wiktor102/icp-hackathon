import React, { useState } from "react";
import { icp_hackathon_backend } from "declarations/icp-hackathon-backend";
import { BrowserRouter, Route, Routes } from "react-router";

import Header from "./Header/Header";
import Home from "./Home/Home";
import ListingDetails from "./ListingDetails/ListingDetails";
import Profile from "./Profile/Profile";
import Cart from "./Cart/Cart";

import { IdentityKitAuthType, InternetIdentity } from "@nfid/identitykit";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import "@nfid/identitykit/react/styles.css";

function App() {
	return (
		<IdentityKitProvider
			className="identity-kit-provider"
			authType={IdentityKitAuthType.DELEGATION}
			featuredSigner={InternetIdentity}
			signerClientOptions={{ targets: ["bkyz2-fmaaa-aaaaa-qaaaq-cai"] }}
		>
			<BrowserRouter>
				<Routes>
					<Route element={<Header />}>
						<Route path="/" element={<Home />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/product/:productId" element={<ListingDetails />} />
						<Route path="/cart" element={<Cart />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</IdentityKitProvider>
	);
}

export default App;
