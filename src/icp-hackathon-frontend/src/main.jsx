import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InternetIdentityProvider } from "ic-use-internet-identity";
import Backend from "./common/hooks/useCanister";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<InternetIdentityProvider
			loginOptions={{
				identityProvider:
					process.env.DFX_NETWORK === "local"
						? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
						: "https://identity.ic0.app"
			}}
		>
			<QueryClientProvider client={queryClient}>
				<Backend />
				<App />
			</QueryClientProvider>
		</InternetIdentityProvider>
	</React.StrictMode>
);
