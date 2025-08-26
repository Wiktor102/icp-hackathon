import { useEffect, useState } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

// hooks
import useStore from "../../store/store.js";

// utils
import { parseBackendListing } from "./useFetchListings";

function useListing(id) {
	const allListings = useStore(state => state.listings);
	const addListings = useStore(state => state.addListings);
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (allListings[id] != null) {
			setLoading(false);
			setListing(allListings[id]);
			return;
		}

		setLoading(true);
		backend
			.get_listing_by_id(id)
			.then(([response]) => {
				response = parseBackendListing(response);
				addListings(response);
				setListing(response);
			})
			.catch(() => setError(true))
			.finally(() => setLoading(false));
	}, []);

	return { listing, loading, error };
}

export default useListing;
