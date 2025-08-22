import { useEffect } from "react";

// hooks and utilities
import useStore from "../../store/store.js";
import { parseBackendListing } from "./useFetchListings.js";
import { useAuthenticatedActor } from "./useActor.js";
import useAuth from "./useAuth.js";

export function useFetchUserListings() {
	const { isAuthenticated, isInitializing } = useAuth();
	const user = useStore(state => state.user);
	const userCreating = useStore(state => state.userCreating);
	const setUserListings = useStore(state => state.setUserListings);
	const setUserListingsLoading = useStore(state => state.setUserListingsLoading);
	const setUserListingsError = useStore(state => state.setUserListingsError);
	const addListings = useStore(state => state.addListings);
	const [actorLoading, actor] = useAuthenticatedActor();

	useEffect(() => {
		const fetchUserListings = async () => {
			// Don't fetch if auth is initializing, not authenticated, user is being created, or we don't have a user yet
			if (isInitializing || !isAuthenticated || userCreating || !user) {
				setUserListings([]);
				return;
			}

			setUserListingsLoading();

			try {
				const { Ok, Err } = await actor.get_listings_by_active_user();

				if (Err) {
					setUserListingsError(Err);
					return;
				}

				const parsedListings = Ok.map(parseBackendListing);
				setUserListings(parsedListings);
				addListings(...parsedListings);
			} catch (error) {
				setUserListingsError(error.message);
				console.error("(fetch user listings) Backend error:", error);
			}
		};

		if (actorLoading) return;
		fetchUserListings();
	}, [
		isAuthenticated,
		isInitializing,
		user,
		userCreating,
		setUserListings,
		setUserListingsLoading,
		setUserListingsError,
		addListings,
		actor,
		actorLoading
	]);
}
