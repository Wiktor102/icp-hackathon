import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// ICP-specific defaults
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			retry: (failureCount, error) => {
				// Don't retry authentication errors
				if (
					error.message?.includes("Invalid signature") ||
					error.message?.includes("unauthorized") ||
					error.message?.includes("forbidden")
				) {
					return false;
				}
				return failureCount < 3;
			},
			retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
		},
		mutations: {
			retry: 1 // Retry mutations once
		}
	}
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>
);
