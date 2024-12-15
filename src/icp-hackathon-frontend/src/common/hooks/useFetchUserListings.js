import { useEffect } from "react";
import { useIdentity } from "@nfid/identitykit/react";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

// hooks and utilities
import useStore from "../../store/store.js";
import { parseBackendListing } from "./useFetchListings.js";

export function useFetchUserListings() {
	const identity = useIdentity();
	const setUserListings = useStore(state => state.setUserListings);
	const setUserListingsLoading = useStore(state => state.setUserListingsLoading);
	const setUserListingsError = useStore(state => state.setUserListingsError);
	const addListings = useStore(state => state.addListings);

	useEffect(() => {
		const fetchUserListings = async () => {
			if (!identity) {
				setUserListings([]);
				return;
			}

			setUserListingsLoading();

			try {
				const { Ok, Err } = await backend.get_listings_by_active_user();

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

		fetchUserListings();
	}, [identity, setUserListings, setUserListingsLoading, setUserListingsError, addListings]);
}
