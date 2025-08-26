import { useEffect } from "react";

// hooks and utilities
import useStore from "../../store/store.js";
import { parseBackendListing } from "./useFetchListings";
import { useCanister } from "./useCanister";
import { useQuery } from "@tanstack/react-query";

export function useFetchUserListings() {
	const user = useStore(state => state.user);
	const userCreating = useStore(state => state.userCreating);
	const setUserListings = useStore(state => state.setUserListings);
	const setUserListingsLoading = useStore(state => state.setUserListingsLoading);
	const setUserListingsError = useStore(state => state.setUserListingsError);
	const addListings = useStore(state => state.addListings);

	const { actor, isAuthenticated, isInitializing } = useCanister();

	const enabled = !isInitializing && isAuthenticated && !userCreating && !!user && !!actor;

	const query = useQuery({
		queryKey: ["userListings", user?.id],
		enabled,
		queryFn: async () => {
			const response = await actor!.get_listings_by_active_user();
			if ("Err" in response) {
				setUserListingsError(response.Err);
				console.error("(fetch user listings) Backend error:", response.Err);
				return [];
			}

			const parsed = response.Ok.map(parseBackendListing);
			setUserListings(parsed);
			addListings(...parsed);
			return parsed;
		}
	});

	// For backwards compatibility, set loading state
	useEffect(() => {
		if (query.isLoading) setUserListingsLoading();
	}, [query.isLoading, setUserListingsLoading]);

	// Optionally, clear listings if not enabled
	useEffect(() => {
		if (!enabled) setUserListings([]);
	}, [enabled, setUserListings]);

	return query;
}
