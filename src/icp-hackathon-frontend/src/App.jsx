import React, { useState } from "react";
import { icp_hackathon_backend } from "declarations/icp-hackathon-backend";
import { BrowserRouter, Route, Routes } from "react-router";

import Header from "./Header/Header";
import Home from "./Home/Home";

import { IdentityKitAuthType, InternetIdentity } from "@nfid/identitykit";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import "@nfid/identitykit/react/styles.css";

function App() {
	return (
		<IdentityKitProvider
			className="identity-kit-provider"
			authType={IdentityKitAuthType.DELEGATION}
			featuredSigner={InternetIdentity}
			signerClientOptions={{ targets: [] }}
		>
			<Header />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		</IdentityKitProvider>
	);
}

export default App;
