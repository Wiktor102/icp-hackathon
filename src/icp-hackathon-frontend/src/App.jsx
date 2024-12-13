import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";

// components
import Home from "./Home/Home";
import Cart from "./Cart/Cart";
import Header from "./Header/Header";
import Profile from "./Profile/Profile";
import AddListing from "./AddListing/AddListing";
import Favorites from "./Favorites/Favorites.jsx";
import ListingDetails from "./ListingDetails/ListingDetails";

import { IdentityKitAuthType, InternetIdentity } from "@nfid/identitykit";
import { IdentityKitProvider } from "@nfid/identitykit/react";

// hooks
import useFetchCategories from "./common/hooks/useFetchCategories.js";
import useFetchListings from "./common/hooks/useFetchListings.js";

// styles
import "@nfid/identitykit/react/styles.css";
import "./common/scss/loaders.min.css";

function App() {
	useFetchCategories();
	useFetchListings();
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
						<Route path="/favorites" element={<Favorites />} />
						<Route path="/add" element={<AddListing />} />
						<Route path="/product/:productId" element={<ListingDetails />} />
						<Route path="/cart" element={<Cart />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</IdentityKitProvider>
	);
}

export default App;
