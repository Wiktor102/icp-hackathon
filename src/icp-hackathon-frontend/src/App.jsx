import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";

// components
import Home from "./Home/Home";
import Header from "./Header/Header";
import Profile from "./pages/Profile/Profile.jsx";
import Favorites from "./pages/Favorites/Favorites.jsx";
import AddListing from "./pages/AddListing/AddListing.jsx";
import ListingDetails from "./pages/ListingDetails/ListingDetails.jsx";

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
			signers={[InternetIdentity]}
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
					</Route>
				</Routes>
			</BrowserRouter>
		</IdentityKitProvider>
	);
}

export default App;
