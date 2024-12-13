import { useEffect, useRef } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";
import useStore from "../../store/store.js";

function useFetchListings() {
	const listings = useStore(state => state.listings);
	const addListings = useStore(state => state.addListings);
	const fetched = useRef(false);

	async function fetchListings() {
		try {
			const response = await backend.get_listings();
			addListings(...response);
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		if (fetched.current) return;
		fetched.current = true;
		fetchListings();
	}, [listings]);
}

function useFetchCategoryListings() {
	const addListings = useStore(state => state.addListings);

	async function fetchListings(category) {
		try {
			const response = await backend.get_listings_by_category(category);
			addListings(...response);
		} catch (error) {
			console.error(error);
		}
	}

	return fetchListings;
}

export { useFetchListings, useFetchCategoryListings };
export default useFetchListings;
